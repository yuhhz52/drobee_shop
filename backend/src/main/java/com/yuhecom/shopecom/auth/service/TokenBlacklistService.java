package com.yuhecom.shopecom.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REFRESH_BLACKLIST_PREFIX = "refresh_blacklist:";
    private static final String ACCESS_BLACKLIST_PREFIX = "access_blacklist:";

    @Autowired
    public TokenBlacklistService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    //REFRESH TOKEN
    public void blacklistRefreshToken(String refreshToken, Date expiryDate) {
        long ttl = expiryDate.getTime() - System.currentTimeMillis();
        if (ttl <= 0) ttl = 1000;
        redisTemplate.opsForValue().set(
                REFRESH_BLACKLIST_PREFIX + refreshToken,
                "true",
                ttl,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isRefreshTokenBlacklisted(String refreshToken) {
        return redisTemplate.hasKey(REFRESH_BLACKLIST_PREFIX + refreshToken);
    }

    //  ACCESS TOKEN chỉ dùng khi user bị khoá
    public void blacklistAccessToken(String accessToken, Date expiryDate) {
        long ttl = expiryDate.getTime() - System.currentTimeMillis();
        if (ttl <= 0) ttl = 1000;
        redisTemplate.opsForValue().set(
                ACCESS_BLACKLIST_PREFIX + accessToken,
                "true",
                ttl,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isAccessTokenBlacklisted(String accessToken) {
        return redisTemplate.hasKey(ACCESS_BLACKLIST_PREFIX + accessToken);
    }
}
