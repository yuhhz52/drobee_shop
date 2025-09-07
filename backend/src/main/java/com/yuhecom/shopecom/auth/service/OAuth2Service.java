package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class OAuth2Service {
    @Autowired
    UsersRepository usersRepository;

    @Autowired
    private AuthorityService authorityService;

    public User getUser(String userName) {
        return usersRepository.findByEmail(userName);
    }

    public User createUser(OAuth2User oAuth2User, String provider) {
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String email = oAuth2User.getAttribute("email");

        User existingUser = usersRepository.findByEmail(email);
        if (existingUser != null) {
            if (!existingUser.getProvider().equalsIgnoreCase(provider)) {
                existingUser.setProvider(provider);
                usersRepository.save(existingUser);
            }
            return existingUser;
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .provider(provider)
                .enabled(true)
                .authorities(authorityService.getUserAuthority())
                .build();

        return usersRepository.save(user);
    }
}














