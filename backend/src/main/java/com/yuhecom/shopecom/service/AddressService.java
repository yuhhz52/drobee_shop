package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.AddressRequest;
import com.yuhecom.shopecom.entity.Address;

import java.security.Principal;
import java.util.UUID;

public interface AddressService {

    Address createAddress(AddressRequest request, Principal principal);

    void deleteAddress(@org.springframework.lang.NonNull UUID id, Principal principal);
}
