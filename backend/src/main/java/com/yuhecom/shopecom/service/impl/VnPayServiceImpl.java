package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.Payment;
import com.yuhecom.shopecom.reponsitory.PaymentRepository;
import com.yuhecom.shopecom.service.VnPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class VnPayServiceImpl implements VnPayService {

    private final PaymentRepository paymentRepository;

    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;

    @Value("${vnpay.pay-url}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;

    @Override
    @Transactional
    public String createPaymentUrl(Order order, String clientIp) {
        String vnpIpAddr = (clientIp != null && !clientIp.isBlank()) ? clientIp : "127.0.0.1";
        long amount = order.getTotalAmount().longValue() * 100;
        String txnRef = getRandomNumber(8);

        Map<String, String> vnpParams = new LinkedHashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "ORDER_ID_" + order.getId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", vnpIpAddr);

        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", sdf.format(cal.getTime()));

        cal.add(Calendar.MINUTE, 15);
        vnpParams.put("vnp_ExpireDate", sdf.format(cal.getTime()));

        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String name : fieldNames) {
            String value = URLEncoder.encode(vnpParams.get(name), StandardCharsets.US_ASCII);
            hashData.append(name).append('=').append(value).append('&');
            query.append(name).append('=').append(value).append('&');
        }

        hashData.setLength(hashData.length() - 1);
        query.setLength(query.length() - 1);

        String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        // Persist txnRef to Payment for later verification on return
        if (order.getPayment() != null) {
            Payment payment = order.getPayment();
            payment.setVnpayTxnRef(txnRef);
            paymentRepository.save(payment);
        }

        log.info("VNPay URL created for orderId={}, txnRef={}", order.getId(), txnRef);
        return vnpPayUrl + "?" + query;
    }

    @Override
    public boolean validateReturn(Map<String, String> params) {
        try {
            String receivedHash = params.get("vnp_SecureHash");
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder data = new StringBuilder();
            for (String key : fieldNames) {
                String value;
                try {
                    value = URLEncoder.encode(params.get(key), StandardCharsets.UTF_8);
                } catch (Exception e) {
                    value = params.get(key);
                }
                data.append(key).append('=').append(value).append('&');
            }
            data.setLength(data.length() - 1);

            String generatedHash = hmacSHA512(vnpHashSecret, data.toString());

            return receivedHash != null && MessageDigest.isEqual(
                    receivedHash.getBytes(StandardCharsets.UTF_8),
                    generatedHash.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.warn("VNPay return validation failed", e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean verifyReturnAmount(Map<String, String> params, Order order) {
        try {
            String vnpAmount = params.get("vnp_Amount");
            if (vnpAmount == null) {
                log.warn("VNPay return missing vnp_Amount for orderId={}", order.getId());
                return false;
            }

            long returnedAmount = Long.parseLong(vnpAmount);
            long expectedAmount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

            if (returnedAmount != expectedAmount) {
                log.warn("VNPay amount mismatch for orderId={}: expected={}, returned={}",
                        order.getId(), expectedAmount, returnedAmount);
                return false;
            }

            // Persist transaction info from VNPay
            if (order.getPayment() != null) {
                Payment payment = order.getPayment();
                payment.setVnpayTransactionNo(params.get("vnp_TransactionNo"));
                payment.setVnpayResponseCode(params.get("vnp_ResponseCode"));
                paymentRepository.save(payment);
            }

            return true;
        } catch (NumberFormatException e) {
            log.warn("VNPay amount parse error: {}", e.getMessage());
            return false;
        }
    }

    private String getRandomNumber(int len) {
        SecureRandom rnd = new SecureRandom();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Không thể tạo hash HmacSHA512", ex);
        }
    }
}
