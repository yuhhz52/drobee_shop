package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.entity.Authority;
import com.yuhecom.shopecom.auth.repository.AuthorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initRoles() {
        if (authorityRepository.findByRoleCode("ROLE_USER") == null) {
            createAuthority("ROLE_USER", "Default user role");
        }
        if (authorityRepository.findByRoleCode("ROLE_ADMIN") == null) {
            createAuthority("ROLE_ADMIN", "Admin role");
        }
    }

    public List<Authority> getUserAuthority(){
        Authority authority = authorityRepository.findByRoleCode("ROLE_USER");
        return List.of(authority);
    }

    @Transactional
    public Authority createAuthority(String role, String description){
        Authority authority= Authority.builder()
                .roleCode(role)
                .roleDescription(description)
                .build();
        return authorityRepository.save(authority);
    }
}
