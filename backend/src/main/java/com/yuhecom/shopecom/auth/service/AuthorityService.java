package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.entity.Authority;
import com.yuhecom.shopecom.auth.repository.AuthorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthorityService {


    @Autowired
    private AuthorityRepository authorityRepository;

    public List<Authority> getUserAuthority(){
        List<Authority> authorities = new ArrayList<>();
        Authority authority= authorityRepository.findByRoleCode("USER");
        authorities.add(authority);
        return authorities;
    }

    public Authority createAuthority(String role, String description){
        Authority authority= Authority.builder().roleCode(role).roleDescription(description).build();
        return authorityRepository.save(authority);
    }
}
