package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.dto.AddressRequest;
import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.repository.AddressRepository;
import com.yuhecom.shopecom.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UsersRepository userRepository;

    @Override
    @Transactional
    public Address createAddress(AddressRequest request, Principal principal) {
        User user = userRepository.findByEmailForAuth(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        boolean hasNoAddresses = !addressRepository.existsByUserId(user.getId());

        Address address = Address.builder()
                .name(request.getName())
                .street(request.getStreet())
                .provinceCode(request.getProvinceCode())
                .provinceName(request.getProvinceName())
                .wardCode(request.getWardCode())
                .wardName(request.getWardName())
                .phoneNumber(request.getPhoneNumber())
                .isDefault(hasNoAddresses)
                .user(user)
                .build();

        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public Address updateAddress(UUID id, AddressRequest request, Principal principal) {
        User user = userRepository.findByEmailForAuth(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found with id " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Address does not belong to user");
        }

        address.setName(request.getName());
        address.setStreet(request.getStreet());
        address.setProvinceCode(request.getProvinceCode());
        address.setProvinceName(request.getProvinceName());
        address.setWardCode(request.getWardCode());
        address.setWardName(request.getWardName());
        address.setPhoneNumber(request.getPhoneNumber());

        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public Address setDefaultAddress(UUID id, Principal principal) {
        User user = userRepository.findByEmailForAuth(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found with id " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Address does not belong to user");
        }

        addressRepository.clearDefaultForUser(user.getId());
        address.setIsDefault(true);
        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public void deleteAddress(@org.springframework.lang.NonNull UUID id, Principal principal) {
        User user = userRepository.findByEmailForAuth(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found with id " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Address does not belong to user");
        }

        addressRepository.delete(address);
    }
}
