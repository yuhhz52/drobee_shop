package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.UploadResult;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.service.FileUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    public UploadResult uploadFileResult(MultipartFile file, String fileName) {
        try {
            if (file == null || file.isEmpty()) {
                return new UploadResult(false, null, "File is required");
            }

            String extension = detectImageExtension(file);
            if (extension == null) {
                return new UploadResult(false, null, "Only PNG, JPG, WEBP, and GIF images are allowed");
            }

            Path dir = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String safePrefix = sanitizePrefix(fileName);
            String storedFileName = safePrefix + "-" + UUID.randomUUID() + extension;
            Path target = dir.resolve(storedFileName).normalize();

            if (!target.startsWith(dir)) {
                throw new AppException(com.yuhecom.shopecom.exception.ErrorCode.DIRECTORY_TRAVERSAL_BLOCKED,
                        "Invalid file path");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target);
            }

            return new UploadResult(true, "/uploads/" + storedFileName, null);
        } catch (Exception e) {
            log.error("File upload failed", e);
            return new UploadResult(false, null, "File upload failed: " + e.getMessage());
        }
    }

    private String sanitizePrefix(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "image";
        }
        String normalized = Path.of(fileName).getFileName().toString();
        int dotIndex = normalized.lastIndexOf('.');
        String withoutExtension = dotIndex > 0 ? normalized.substring(0, dotIndex) : normalized;
        String safe = withoutExtension.replaceAll("[^a-zA-Z0-9\\-_]", "_");
        return safe.isBlank() ? "image" : safe;
    }

    private String detectImageExtension(MultipartFile file) throws IOException {
        byte[] header;
        try (InputStream inputStream = file.getInputStream()) {
            header = inputStream.readNBytes(12);
        }

        if (header.length >= 8 && header[0] == (byte) 0x89 && header[1] == 0x50
                && header[2] == 0x4E && header[3] == 0x47) {
            return ".png";
        }
        if (header.length >= 3 && header[0] == (byte) 0xFF && header[1] == (byte) 0xD8
                && header[2] == (byte) 0xFF) {
            return ".jpg";
        }
        if (header.length >= 6 && header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46) {
            return ".gif";
        }
        if (header.length >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46
                && header[3] == 0x46 && header[8] == 0x57 && header[9] == 0x45
                && header[10] == 0x42 && header[11] == 0x50) {
            return ".webp";
        }
        return null;
    }
}
