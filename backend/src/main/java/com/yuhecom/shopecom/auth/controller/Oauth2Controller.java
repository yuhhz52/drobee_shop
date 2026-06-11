package com.yuhecom.shopecom.auth.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/oauth2")
public class Oauth2Controller {

    /**
     * FE gọi endpoint này sau khi redirect từ OAuth2 để lấy tokens
     * từ HTTP-Only cookies mà OAuth2LoginSuccessHandler đã set.
     */
    @GetMapping("/tokens")
    public ResponseEntity<Map<String, String>> getTokens(HttpServletRequest request) {
        String accessToken = null;
        String refreshToken = null;

        for (Cookie c : request.getCookies()) {
            switch (c.getName()) {
                case "accessToken" -> accessToken = c.getValue();
                case "refreshToken" -> refreshToken = c.getValue();
            }
        }

        if (accessToken != null && refreshToken != null) {
            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
            return ResponseEntity.ok(tokens);
        }

        return ResponseEntity.notFound().build();
    }
}
