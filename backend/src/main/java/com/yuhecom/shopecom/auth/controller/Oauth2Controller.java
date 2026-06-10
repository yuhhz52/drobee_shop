package com.yuhecom.shopecom.auth.controller;

import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.service.OAuth2Service;
import com.yuhecom.shopecom.config.AppProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/oauth2")
public class Oauth2Controller {

    @Autowired
    private OAuth2Service oAuth2Service;

    @Autowired
    private JWTTokenHelper jwtTokenHelper;

    @Autowired
    private AppProperties appProperties;

    @GetMapping("/success")
    public void callbackOAuth2(@AuthenticationPrincipal OAuth2User oAuth2User, HttpServletResponse response) throws IOException {
        String userName = oAuth2User.getAttribute("email");
        User user = oAuth2Service.getUser(userName);
        if (user == null) {
            user = oAuth2Service.createUser(oAuth2User, "google");
        }

        String token = jwtTokenHelper.generateToken(user);
        String redirectUri = appProperties.getOauth2().getRedirectUri();
        String separator = redirectUri.contains("?") ? "&" : "?";

        response.sendRedirect(redirectUri + separator + "token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8));
    }

    /**
     * Endpoint để đọc tokens từ HTTP-Only cookies
     * Frontend gọi endpoint này sau khi redirect từ OAuth2
     */
    @GetMapping("/tokens")
    public ResponseEntity<Map<String, String>> getTokensFromCookies(HttpServletRequest request) {
        Map<String, String> tokens = new HashMap<>();
        String accessToken = null;
        String refreshToken = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                } else if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (accessToken != null && refreshToken != null) {
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
            return ResponseEntity.ok(tokens);
        }

        return ResponseEntity.notFound().build();
    }
}

















