package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.AddressRequest;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<ApiResponse<Address>> createAddress(
            @Valid @RequestBody AddressRequest request,
            Principal principal) {
        Address address = addressService.createAddress(request, principal);
        return ResponseEntity.ok(ApiResponse.<Address>builder().result(address).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request,
            Principal principal) {
        Address address = addressService.updateAddress(id, request, principal);
        return ResponseEntity.ok(ApiResponse.<Address>builder().result(address).build());
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<ApiResponse<Address>> setDefaultAddress(
            @PathVariable UUID id,
            Principal principal) {
        Address address = addressService.setDefaultAddress(id, principal);
        return ResponseEntity.ok(ApiResponse.<Address>builder().result(address).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID id,
            Principal principal) {
        addressService.deleteAddress(id, principal);
        return ResponseEntity.ok(ApiResponse.<Void>builder().result(null).build());
    }
}
