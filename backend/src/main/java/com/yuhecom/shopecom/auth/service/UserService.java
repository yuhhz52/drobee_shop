package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.dto.UsersDto;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.dto.UploadResult;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.mapper.UsersMapper;
import com.yuhecom.shopecom.service.FileUploadService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private static final long MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

    private final UsersRepository userRepository;
    private final UsersMapper usersMapper;
    private final UserDetailsService userDetailsService;
    private final FileUploadService fileUploadService;

    /**
     * Lấy profile user hiện tại từ Principal
     */
    public UsersDto getUserProfile(Principal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.PRINCIPAL_REQUIRED, "Principal is null");
        }

        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found");
        }

        return usersMapper.toDto(user);
    }

    public UsersDto updateAvatar(Principal principal, MultipartFile avatarFile) {
        log.info(
                "Starting avatar update. principal={}, filePresent={}, fileSize={}, contentType={}",
                principal != null ? principal.getName() : "null",
                avatarFile != null,
                avatarFile != null ? avatarFile.getSize() : -1,
                avatarFile != null ? avatarFile.getContentType() : "null"
        );
        if (principal == null) {
            log.warn("Avatar update rejected: principal is null");
            throw new AppException(ErrorCode.PRINCIPAL_REQUIRED, "Principal is null");
        }
        if (avatarFile == null || avatarFile.isEmpty()) {
            log.warn("Avatar update rejected: avatar file missing/empty for {}", principal.getName());
            throw new AppException(ErrorCode.BAD_REQUEST, "Avatar file is required");
        }
        if (avatarFile.getSize() > MAX_AVATAR_SIZE_BYTES) {
            log.warn("Avatar update rejected: file too large={} bytes for {}", avatarFile.getSize(), principal.getName());
            throw new AppException(ErrorCode.BAD_REQUEST, "Avatar is too large. Max size is 5MB");
        }

        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        if (user == null) {
            log.warn("Avatar update rejected: user not found for principal={}", principal.getName());
            throw new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found");
        }

        String contentType = avatarFile.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            log.warn("Avatar update rejected: invalid contentType={} for {}", contentType, principal.getName());
            throw new AppException(ErrorCode.BAD_REQUEST, "Avatar must be an image file");
        }

        String extension = resolveExtension(contentType, avatarFile.getOriginalFilename());
        String fileName = "avatar-" + user.getId() + "-" + System.currentTimeMillis() + extension;
        log.info("Uploading avatar file for userId={}, targetFile={}", user.getId(), fileName);
        UploadResult uploadResult = fileUploadService.uploadFileResult(avatarFile, fileName);
        if (!uploadResult.success()) {
            log.error("Avatar upload failed for userId={}, reason={}", user.getId(), uploadResult.message());
            throw new AppException(ErrorCode.BAD_REQUEST, uploadResult.message());
        }

        user.setAvatarUrl(uploadResult.url());
        User savedUser = userRepository.save(user);
        log.info("Avatar updated successfully. userId={}, avatarUrl={}", savedUser.getId(), savedUser.getAvatarUrl());
        return usersMapper.toDto(savedUser);
    }

    private String resolveExtension(String contentType, String originalFileName) {
        if (contentType.equalsIgnoreCase(MediaType.IMAGE_PNG_VALUE)) {
            return ".png";
        }
        if (contentType.equalsIgnoreCase(MediaType.IMAGE_JPEG_VALUE)) {
            return ".jpg";
        }
        if (contentType.equalsIgnoreCase(MediaType.IMAGE_GIF_VALUE)) {
            return ".gif";
        }
        if (contentType.equalsIgnoreCase("image/webp")) {
            return ".webp";
        }

        if (originalFileName != null && originalFileName.contains(".")) {
            String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase(Locale.ROOT);
            if (extension.matches("\\.(png|jpg|jpeg|gif|webp)")) {
                return extension.equals(".jpeg") ? ".jpg" : extension;
            }
        }
        return ".png";
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
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + id));

        user.getAuthorities().clear();
        user.getAddressList().clear();

        userRepository.delete(user);
    }
}
