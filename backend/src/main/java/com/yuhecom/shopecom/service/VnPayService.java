package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.entity.Order;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VnPayService {

    @Value("${vnpay.tmnCode}")
    String vnpTmnCode;

    @Value("${vnpay.hashSecret}")
    String vnpHashSecret;

    @Value("${vnpay.payUrl}")
    String vnpPayUrl;

    @Value("${vnpay.returnUrl}")
    String vnpReturnUrl;

    public String createPaymentUrl(Order order) {
        try {
            String vnpVersion = "2.1.0";
            String vnpCommand = "pay";
            String orderType = "other";
            long amount = order.getTotalAmount().longValue() * 100; // VNPay dùng đơn vị nhỏ nhất

            String vnpTxnRef = getRandomNumber(8);
            String vnpIpAddr = "127.0.0.1"; // có thể lấy từ request nếu cần

            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnpVersion);
            vnpParams.put("vnp_Command", vnpCommand);
            vnpParams.put("vnp_TmnCode", vnpTmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", vnpTxnRef);
            vnpParams.put("vnp_OrderInfo", "ORDER_ID_" + order.getId().toString());
            vnpParams.put("vnp_OrderType", orderType);
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
            vnpParams.put("vnp_IpAddr", vnpIpAddr);

            // Thời gian tạo
            Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            String createDate = sdf.format(cal.getTime());
            vnpParams.put("vnp_CreateDate", createDate);

            // Thời gian hết hạn
            cal.add(Calendar.MINUTE, 15);
            String expireDate = sdf.format(cal.getTime());
            vnpParams.put("vnp_ExpireDate", expireDate);

            // Sắp xếp tham số
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (String name : fieldNames) {
                String value = URLEncoder.encode(vnpParams.get(name), StandardCharsets.US_ASCII.toString());
                hashData.append(name).append('=').append(value).append('&');
                query.append(name).append('=').append(value).append('&');
            }

            hashData.setLength(hashData.length() - 1);
            query.setLength(query.length() - 1);

            String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
            query.append("&vnp_SecureHash=").append(secureHash);

            return vnpPayUrl + "?" + query.toString();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo URL thanh toán VNPay", e);
        }
    }

    public boolean validateReturn(Map<String, String> params) {
        try {
            String receivedHash = params.get("vnp_SecureHash");
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder data = new StringBuilder();
            for (String key : fieldNames) {
                String value = params.get(key);
                // URL decode value trước khi tạo hash
                try {
                    value = java.net.URLDecoder.decode(value, StandardCharsets.UTF_8.toString());
                } catch (Exception e) {
                    // Nếu decode fail thì giữ nguyên value
                }
                data.append(key).append('=').append(value).append('&');
            }

            data.setLength(data.length() - 1);
            String generatedHash = hmacSHA512(vnpHashSecret, data.toString());

            return receivedHash != null && receivedHash.equals(generatedHash);
        } catch (Exception e) {
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
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA512");
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