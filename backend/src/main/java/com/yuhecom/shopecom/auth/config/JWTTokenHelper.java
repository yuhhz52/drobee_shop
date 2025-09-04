package com.yuhecom.shopecom.auth.config;

import com.yuhecom.shopecom.auth.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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

    @Value("${jwt.signerKey}")
    private String secretKey;

    @Value("${jwt.auth.expires_in}")
    private int expiresIn;

    @Value("${jwt.refresh.expires_in}")
    private int refreshExpiresIn;

    /**
     * Sinh JWT token cho user
     */
    public String generateToken(User user) {
        List<String> roles = user.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getUsername()) // hoặc user.getEmail()
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(generateExpirationDate())
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public String generateRefreshToken(User user) {
        List<String> roles = user.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("roles", roles) // thêm roles vào refresh token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiresIn * 1000L))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Lấy Signing key từ secret
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey); // secretKey để ở Base64 trong application.yml
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Date generateExpirationDate() {
        return new Date(System.currentTimeMillis() + expiresIn * 1000L);
    }

    /**
     * Lấy token từ request
     */
    public String getToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Validate token với UserDetails (dùng cho filter, refresh)
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUserNameFromToken(token);
        return username != null &&
                username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token);
    }

    /**
     * Validate token không cần UserDetails (dùng cho logout)
     */
    public Boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token); // parse ok => chữ ký đúng
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateTokenLenient(String token) {
        try {
            getAllClaimsFromToken(token);
            return true; // chữ ký hợp lệ, ignore expired
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date expireDate = getExpirationDate(token);
        return expireDate.before(new Date());
    }

    public Date getExpirationDate(String token) {
        final Claims claims = this.getAllClaimsFromToken(token);
        return claims.getExpiration();
    }

    public String getUserNameFromToken(String token) {
        final Claims claims = this.getAllClaimsFromToken(token);
        return claims.getSubject();
    }

    public List<String> getRolesFromToken(String token) {
        final Claims claims = this.getAllClaimsFromToken(token);
        return claims.get("roles", List.class);
    }

    private Claims getAllClaimsFromToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("JWT Token is missing");
        }
        if (token.split("\\.").length != 3) {
            throw new MalformedJwtException("Invalid JWT format: " + token);
        }

        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
