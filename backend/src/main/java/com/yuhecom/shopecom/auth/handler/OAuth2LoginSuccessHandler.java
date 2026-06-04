package com.yuhecom.shopecom.auth.handler;

import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.service.OAuth2Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private OAuth2Service oAuth2Service;

    @Autowired
    private JWTTokenHelper jwtTokenHelper;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Value("${jwt.auth.expires_in}")
    private int expiresIn;

    @Value("${jwt.refresh.expires_in}")
    private int refreshExpiresIn;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null || email.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not provided by OAuth2 provider");
            return;
        }

        User user = oAuth2Service.getUser(email);
        if (user == null) {
            user = oAuth2Service.createUser(oAuth2User, "google");
        }

        // Sinh accessToken và refreshToken
        String accessToken = jwtTokenHelper.generateToken(user);
        String refreshToken = jwtTokenHelper.generateRefreshToken(user);

        // Thiết lập cookies (KHÔNG httpOnly để JS có thể đọc sau redirect)
        addTokenCookie(request, response, "accessToken", accessToken, expiresIn);
        addTokenCookie(request, response, "refreshToken", refreshToken, refreshExpiresIn);

        // Redirect với tokens trong URL để callback có thể đọc
        String redirectUrl = redirectUri + "?accessToken=" + accessToken + "&refreshToken=" + refreshToken;
        response.sendRedirect(redirectUrl);
    }

    private void addTokenCookie(HttpServletRequest request, HttpServletResponse response, String name, String value, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(false)
                .secure(request.isSecure())
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

}
