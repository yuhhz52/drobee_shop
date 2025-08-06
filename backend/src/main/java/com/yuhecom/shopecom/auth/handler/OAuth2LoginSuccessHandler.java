package com.yuhecom.shopecom.auth.handler;


import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.service.OAuth2Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = oAuth2Service.getUser(email);
        if (user == null) {
            user = oAuth2Service.createUser(oAuth2User, "google");
        }

        String token = jwtTokenHelper.generateToken(user.getUsername());

        // Chuyển về FE kèm token
        response.sendRedirect("http://localhost:5175/oauth2/callback?token=" + token);
    }
}
