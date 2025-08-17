package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.dto.UsersDto;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UsersRepository userRepository;

    public Page<UsersDto> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size, Sort.by("createdOn").descending()))
                .map(user -> UsersDto.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .phoneNumber(user.getPhoneNumber())
                        .email(user.getEmail())
                        .authorityList(
                                user.getAuthorities().stream()
                                        .map(a -> a.getAuthority())
                                        .toList()
                        )
                        .addressList(user.getAddressList())
                        .build());
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getAuthorities().clear(); // xoá quan hệ many-to-many
        userRepository.delete(user);
    }
}
