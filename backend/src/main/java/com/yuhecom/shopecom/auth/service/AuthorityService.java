package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.entity.Authority;
import com.yuhecom.shopecom.auth.repository.AuthorityRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthorityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @PostConstruct
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

    public Authority createAuthority(String role, String description){
        Authority authority= Authority.builder()
                .roleCode(role)
                .roleDescription(description)
                .build();
        return authorityRepository.save(authority);
    }
}
