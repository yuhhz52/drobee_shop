package com.yuhecom.shopecom.auth.config;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JWTTokenHelper {

    @Value("${jwt.auth.signer-key}")
    private String authSecretKey;

    @Value("${jwt.refresh.signer-key}")
    private String refreshSecretKey;

    @Value("${jwt.auth.expires-in}")
    private int expiresIn;

    @Value("${jwt.refresh.expires-in}")
    private int refreshExpiresIn;

    public static final String TYPE_ACCESS  = "access";
    public static final String TYPE_REFRESH = "refresh";

    @PostConstruct
    public void validateSecrets() {
        if (authSecretKey == null || authSecretKey.isBlank()) {
            throw new IllegalStateException("jwt.auth.signer-key is required. Set JWT_AUTH_SECRET environment variable.");
        }
        if (refreshSecretKey == null || refreshSecretKey.isBlank()) {
            throw new IllegalStateException("jwt.refresh.signer-key is required. Set JWT_REFRESH_SECRET environment variable.");
        }
        if (authSecretKey.equals(refreshSecretKey)) {
            throw new IllegalStateException("JWT_AUTH_SECRET and JWT_REFRESH_SECRET must be different values.");
        }
    }

    public String generateToken(User user) {
        return buildToken(user, TYPE_ACCESS, expiresIn);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, TYPE_REFRESH, refreshExpiresIn);
    }

    private String buildToken(User user, String tokenType, int expirySeconds) {
        List<String> roles = user.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirySeconds * 1000L);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("tokenType", tokenType)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(tokenType), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey(String tokenType) {
        String secret = TYPE_ACCESS.equals(tokenType) ? authSecretKey : refreshSecretKey;
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Validate access token với UserDetails (dùng trong JWT filter).
     * Chỉ chấp nhận token có type=access và đúng secret key.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            Claims claims = getAllClaimsFromToken(token, TYPE_ACCESS);
            String username = claims.getSubject();
            String tokenType = claims.get("tokenType", String.class);
            Date expiration = claims.getExpiration();

            return TYPE_ACCESS.equals(tokenType)
                    && username != null
                    && username.equals(userDetails.getUsername())
                    && expiration.after(new Date());
        } catch (JwtException | AppException e) {
            return false;
        }
    }

    /**
     * Validate refresh token không cần UserDetails (dùng trong /refresh endpoint).
     * Chỉ chấp nhận token có type=refresh và đúng secret key.
     */
    public Boolean validateRefreshToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token, TYPE_REFRESH);
            String tokenType = claims.get("tokenType", String.class);
            Date expiration = claims.getExpiration();

            return TYPE_REFRESH.equals(tokenType) && expiration.after(new Date());
        } catch (JwtException | AppException e) {
            return false;
        }
    }

    /**
     * Validate token với secret cụ thể (dùng cho logout / unknown token type).
     */
    public Boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token, null);
            return true;
        } catch (JwtException | AppException e) {
            return false;
        }
    }

    private Claims getAllClaimsFromToken(String token, String expectedType) {
        if (token == null || token.trim().isEmpty()) {
            throw new AppException(ErrorCode.JWT_TOKEN_MISSING, "JWT Token is missing");
        }
        if (token.split("\\.").length != 3) {
            throw new AppException(ErrorCode.JWT_TOKEN_INVALID, "Invalid JWT format");
        }

        if (expectedType != null) {
            Key key = getSigningKey(expectedType);
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }

        // Fallback: thử access key trước, nếu fail thử refresh key
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey(TYPE_ACCESS))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e1) {
            try {
                return Jwts.parserBuilder()
                        .setSigningKey(getSigningKey(TYPE_REFRESH))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (JwtException e2) {
                throw new AppException(ErrorCode.JWT_TOKEN_INVALID, "Token signed with unknown key");
            }
        }
    }

    public Date getExpirationDate(String token) {
        return getAllClaimsFromToken(token, null).getExpiration();
    }

    public String getUserNameFromToken(String token) {
        return getAllClaimsFromToken(token, null).getSubject();
    }

    public String getTokenType(String token) {
        return getAllClaimsFromToken(token, null).get("tokenType", String.class);
    }

    public List<String> getRolesFromToken(String token) {
        return getAllClaimsFromToken(token, null).get("roles", List.class);
    }
}
