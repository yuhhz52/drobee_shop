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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final long MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

    private final UsersRepository userRepository;
    private final UsersMapper usersMapper;
    private final FileUploadService fileUploadService;

    @Transactional(readOnly = true)
    public UsersDto getUserProfile(Principal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.PRINCIPAL_REQUIRED, "Principal is null");
        }
        User user = userRepository.findByEmailForProfile(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));
        return usersMapper.toDto(user);
    }

    @Transactional
    public UsersDto updateAvatar(@org.springframework.lang.NonNull Principal principal,
                                @org.springframework.lang.NonNull MultipartFile avatarFile) {
        log.info("Avatar update. principal={}, file={}, size={}",
                principal != null ? principal.getName() : "null",
                avatarFile != null ? avatarFile.getOriginalFilename() : "null",
                avatarFile != null ? avatarFile.getSize() : -1);

        validatePrincipal(principal);
        validateAvatarFile(avatarFile);

        User user = userRepository.findByEmailForProfile(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        String extension = resolveExtension(avatarFile.getContentType(), avatarFile.getOriginalFilename());
        String fileName = "avatar-" + user.getId() + "-" + System.currentTimeMillis() + extension;

        UploadResult result = fileUploadService.uploadFileResult(avatarFile, fileName);
        if (!result.success()) {
            throw new AppException(ErrorCode.BAD_REQUEST, result.message());
        }

        user.setAvatarUrl(result.url());
        User saved = userRepository.save(user);
        log.info("Avatar updated. userId={}, url={}", saved.getId(), saved.getAvatarUrl());
        return usersMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<UsersDto> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size, Sort.by("createdOn").descending()))
                .map(usersMapper::toDto);
    }

    @Transactional
    public void deleteUser(@org.springframework.lang.NonNull java.util.UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + id));

        user.getAuthorities().clear();
        user.getAddressList().clear();
        userRepository.delete(user);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void validatePrincipal(Principal principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.PRINCIPAL_REQUIRED, "Principal is null");
        }
    }

    private void validateAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Avatar file is required");
        }
        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Avatar is too large. Max size is 5MB");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Avatar must be an image file");
        }
    }

    private String resolveExtension(String contentType, String originalFileName) {
        if (contentType == null) return ".png";
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_GIF_VALUE -> ".gif";
            case "image/webp" -> ".webp";
            default -> {
                if (originalFileName != null) {
                    int dot = originalFileName.lastIndexOf('.');
                    if (dot > 0) {
                        String ext = originalFileName.substring(dot).toLowerCase(Locale.ROOT);
                        if (ext.matches("\\.(png|jpg|jpeg|gif|webp)")) {
                            yield ext.equals(".jpeg") ? ".jpg" : ext;
                        }
                    }
                }
                yield ".png";
            }
        };
    }
}
