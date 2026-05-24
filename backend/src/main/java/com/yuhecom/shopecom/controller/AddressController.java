package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.AddressRequest;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PostMapping
    public ResponseEntity<ApiResponse<Address>> createAddress(@RequestBody AddressRequest addressRequest, Principal principal){
        Address address = addressService.createAddress(addressRequest, principal);
        return ResponseEntity.ok(ApiResponse.<Address>builder().result(address).build());

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable UUID id){
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().result(null).build());
    }


}
