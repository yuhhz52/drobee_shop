package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.dto.UsersDto;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.mapper.UsersMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UsersRepository userRepository;
    private final UsersMapper usersMapper;
    private final UserDetailsService userDetailsService;

    /**
     * Lấy profile user hiện tại từ Principal
     */
    public UsersDto getUserProfile(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Principal is null");
        }

        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        return usersMapper.toDto(user);
    }

    /**
     * Lấy danh sách user có phân trang
     */
    public Page<UsersDto> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size, Sort.by("createdOn").descending()))
                .map(usersMapper::toDto);
    }

    /**
     * Xoá user và các quan hệ
     */
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.getAuthorities().clear();
        user.getAddressList().clear();

        userRepository.delete(user);
    }
}
