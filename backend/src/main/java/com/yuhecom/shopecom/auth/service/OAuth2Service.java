package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UsersRepository userRepository;
    private final AuthorityService authorityService;

    /**
     * Check user tồn tại — dùng query KHÔNG fetch bag nào.
     * Dùng khi OAuth2 handler muốn biết user có tồn tại không để quyết định create/update.
     */
    @Transactional(readOnly = true)
    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Load user cho OAuth2 handler — không cần addressList (chỉ cần authorities để generate token).
     */
    @Transactional(readOnly = true)
    public User getUser(String email) {
        return userRepository.findByEmailForAuth(email).orElse(null);
    }

    /**
     * Create user mới hoặc update provider nếu email đã tồn tại.
     */
    @Transactional
    @org.springframework.lang.NonNull
    public User createOrUpdateUser(OAuth2User oAuth2User, String provider) {
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        var existingOpt = userRepository.findByEmail(email);
        if (existingOpt.isPresent()) {
            User existing = existingOpt.get();
            Hibernate.initialize(existing.getAuthorities());
            if (!provider.equalsIgnoreCase(existing.getProvider())) {
                existing.setProvider(provider);
                return userRepository.save(existing);
            }
            return existing;
        }

        User newUser = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .provider(provider)
                .enabled(true)
                .authorities(authorityService.getUserAuthority())
                .build();
        @SuppressWarnings("null")
        User saved = userRepository.save(newUser);
        return saved;
    }
}
