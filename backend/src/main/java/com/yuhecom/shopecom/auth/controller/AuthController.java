package com.yuhecom.shopecom.auth.controller;

import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.dto.LoginRequest;
import com.yuhecom.shopecom.auth.dto.RegistrationRequest;
import com.yuhecom.shopecom.auth.dto.RegistrationResponse;
import com.yuhecom.shopecom.auth.dto.UserToken;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.service.RegistrationService;
import com.yuhecom.shopecom.auth.service.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    RegistrationService registrationService;

    @Autowired
    UserDetailsService userDetailsService;

    @Autowired
    JWTTokenHelper jwtTokenHelper;

    @Autowired
    TokenBlacklistService tokenBlacklistService;


    @PostMapping("/login")
    public ResponseEntity<UserToken> login(@RequestBody LoginRequest loginRequest){
            try{
                Authentication authentication= UsernamePasswordAuthenticationToken.unauthenticated(loginRequest.getUserName(),
                        loginRequest.getPassword());

                Authentication authenticationResponse = this.authenticationManager.authenticate(authentication);

                if(authenticationResponse.isAuthenticated()){
                    User user = (User) authenticationResponse.getPrincipal();
                    if(!user.isEnabled()){
                        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
                    }

                    String accessToken = jwtTokenHelper.generateToken(user);
                    String refreshToken = jwtTokenHelper.generateRefreshToken(user);

                    UserToken userToken = UserToken.builder()
                            .token(accessToken)
                            .refreshToken(refreshToken)
                            .build();
                    return new ResponseEntity<>(userToken,HttpStatus.OK);

                }
            }catch (Exception e){
                throw new RuntimeException(e);
            }
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest request){
        RegistrationResponse registrationResponse = registrationService.createUser(request);

        return new ResponseEntity<>(registrationResponse,
                registrationResponse.getCode() == 200 ? HttpStatus.OK: HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String,String> map){
        String userName = map.get("userName");
        String code = map.get("code");

        User user= (User) userDetailsService.loadUserByUsername(userName);
        if(null != user && user.getVerificationCode().equals(code)){
            registrationService.verifyUser(userName);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }


    //Refresh token: dùng refreshToken để lấy accessToken mới
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            return new ResponseEntity<>("Missing refresh token", HttpStatus.BAD_REQUEST);
        }

        try {
            String username = jwtTokenHelper.getUserNameFromToken(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtTokenHelper.validateToken(refreshToken, userDetails)) {
                String newAccessToken = jwtTokenHelper.generateToken((User) userDetails);
                UserToken userToken = UserToken.builder()
                        .token(newAccessToken)
                        .refreshToken(refreshToken)
                        .build();
                return new ResponseEntity<>(userToken, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity<>("Invalid refresh token", HttpStatus.UNAUTHORIZED);
    }



    //Logout: đưa accessToken vào blacklist Redis
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken != null) {
            try {
                Date expiry = jwtTokenHelper.getExpirationDate(refreshToken);
                tokenBlacklistService.blacklistRefreshToken(refreshToken, expiry);
            } catch (Exception e) {
                // Token expired hoặc invalid -> vẫn cho phép logout, TTL = 1s
                tokenBlacklistService.blacklistRefreshToken(
                        refreshToken,
                        new Date(System.currentTimeMillis() + 1000)
                );
            }
        }
        return ResponseEntity.ok("Logged out successfully");
    }






}


