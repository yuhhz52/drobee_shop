package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.AddressRequest;
import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.reponsitory.AddressRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AddressService {

    UserDetailsService userDetailsService;
    AddressRepository addressRepository;

    public Address createAddress(AddressRequest addressRequest, Principal principal){

        User user = (User) userDetailsService.loadUserByUsername(principal.getName());

        Address address = Address.builder()
                .name(addressRequest.getName())
                .street(addressRequest.getStreet())
                .city(addressRequest.getCity())
                .state(addressRequest.getState())
                .zipCode(addressRequest.getZipCode())
                .phoneNumber(addressRequest.getPhoneNumber())
                .user(user)
                .build();

        return addressRepository.save(address);
    }

    public void deleteAddress(UUID id) {
        addressRepository.deleteById(id);
    }
}














