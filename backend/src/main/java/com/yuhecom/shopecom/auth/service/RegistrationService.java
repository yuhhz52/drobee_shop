package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.dto.RegistrationRequest;
import com.yuhecom.shopecom.auth.dto.RegistrationResponse;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.helper.VerificationCodeGenerator;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final UsersRepository userRepository;
    private final AuthorityService authorityService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public RegistrationResponse createUser(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return RegistrationResponse.builder()
                    .code(400)
                    .message("Email already exists")
                    .build();
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("manual")
                .enabled(false)
                .verificationCode(VerificationCodeGenerator.generateCode())
                .authorities(authorityService.getUserAuthority())
                .build();

        userRepository.save(user);
        emailService.sendMail(user);

        log.info("User registered: {}", user.getEmail());
        return RegistrationResponse.builder()
                .code(200)
                .message("User created!")
                .build();
    }

    @Transactional
    public void verifyUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        user.setEnabled(true);
        user.setVerificationCode(null);
        userRepository.save(user);
        log.info("User verified: {}", email);
    }
}
