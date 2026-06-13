package com.yuhecom.shopecom.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitService {

    private final Map<String, Bucket> ipBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();

    public static final int LOGIN_REQUESTS_PER_MINUTE = 5;
    public static final int GENERAL_REQUESTS_PER_MINUTE = 100;
    public static final int CHECKOUT_REQUESTS_PER_MINUTE = 10;
    public static final int CART_REQUESTS_PER_MINUTE = 60;

    public Bucket resolveIpBucket(String ip) {
        return ipBuckets.computeIfAbsent(ip, this::createIpBucket);
    }

    public Bucket resolveUserBucket(String userId) {
        return userBuckets.computeIfAbsent(userId, this::createUserBucket);
    }

    public boolean tryConsumeLogin(String ip) {
        Bucket bucket = resolveLoginBucket(ip);
        boolean consumed = bucket.tryConsume(1);
        if (!consumed) {
            log.warn("Rate limit exceeded for login from IP: {}", ip);
        }
        return consumed;
    }

    public boolean tryConsumeGeneral(String key) {
        Bucket bucket = resolveIpBucket("general:" + key);
        return bucket.tryConsume(1);
    }

    public boolean tryConsumeCheckout(String userId) {
        Bucket bucket = resolveCheckoutBucket(userId);
        boolean consumed = bucket.tryConsume(1);
        if (!consumed) {
            log.warn("Rate limit exceeded for checkout for user: {}", userId);
        }
        return consumed;
    }

    public boolean tryConsumeCart(String key) {
        Bucket bucket = resolveCartBucket(key);
        boolean consumed = bucket.tryConsume(1);
        if (!consumed) {
            log.warn("Rate limit exceeded for cart for key: {}", key);
        }
        return consumed;
    }

    private Bucket resolveLoginBucket(String ip) {
        return ipBuckets.computeIfAbsent("login:" + ip, this::createLoginBucket);
    }

    private Bucket resolveCheckoutBucket(String userId) {
        return userBuckets.computeIfAbsent("checkout:" + userId, this::createCheckoutBucket);
    }

    private Bucket resolveCartBucket(String key) {
        return ipBuckets.computeIfAbsent("cart:" + key, this::createCartBucket);
    }

    private Bucket createIpBucket(String key) {
        return Bucket.builder()
                .addLimit(buildBandwidth(GENERAL_REQUESTS_PER_MINUTE))
                .build();
    }

    private Bucket createUserBucket(String key) {
        return Bucket.builder()
                .addLimit(buildBandwidth(GENERAL_REQUESTS_PER_MINUTE))
                .build();
    }

    private Bucket createLoginBucket(String key) {
        return Bucket.builder()
                .addLimit(buildBandwidth(LOGIN_REQUESTS_PER_MINUTE))
                .build();
    }

    private Bucket createCheckoutBucket(String key) {
        return Bucket.builder()
                .addLimit(buildBandwidth(CHECKOUT_REQUESTS_PER_MINUTE))
                .build();
    }

    private Bucket createCartBucket(String key) {
        return Bucket.builder()
                .addLimit(buildBandwidth(CART_REQUESTS_PER_MINUTE))
                .build();
    }

    private Bandwidth buildBandwidth(int requestsPerMinute) {
        return Bandwidth.builder()
                .capacity(requestsPerMinute)
                .refillIntervally(requestsPerMinute, Duration.ofMinutes(1))
                .build();
    }

    public void clearExpiredBuckets() {
        ipBuckets.clear();
        userBuckets.clear();
    }
}
