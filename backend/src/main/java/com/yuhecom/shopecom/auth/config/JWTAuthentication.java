package com.yuhecom.shopecom.auth.config;

import com.yuhecom.shopecom.auth.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public class JWTAuthentication extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JWTTokenHelper jwtTokenHelper;
    private final TokenBlacklistService tokenBlacklistService;

    public JWTAuthentication(JWTTokenHelper jwtTokenHelper, 
                             UserDetailsService userDetailsService,
                             TokenBlacklistService tokenBlacklistService) {
        this.jwtTokenHelper = jwtTokenHelper;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/uploads/")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/api/auth")
                || path.startsWith("/oauth2/success")
                || path.startsWith("/oauth2/tokens")
                || path.startsWith("/oauth2/authorization")
                || path.startsWith("/login/oauth2/code")
                || path.startsWith("/api/orders/vnpay-return")
                || path.startsWith("/actuator/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Kiểm tra xem token này có nằm trong danh sách đen không (do đăng xuất/khóa tài khoản)
                if (tokenBlacklistService.isAccessTokenBlacklisted(token)) {
                    log.warn("Access token has been blacklisted: {}", token.substring(0, Math.min(10, token.length())) + "...");
                    filterChain.doFilter(request, response);
                    return;
                }

                String username = jwtTokenHelper.getUserNameFromToken(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails;
                    try {
                        userDetails = userDetailsService.loadUserByUsername(username);
                    } catch (UsernameNotFoundException ex) {
                        log.warn("JWT rejected: user no longer exists ({})", username);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    if (jwtTokenHelper.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception ex) {
                log.warn("JWT validation failed: {}", ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

}
















