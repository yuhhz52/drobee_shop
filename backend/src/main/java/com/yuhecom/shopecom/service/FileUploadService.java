package com.yuhecom.shopecom.service;

import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.yuhecom.shopecom.dto.UploadResult;

import java.io.File;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class FileUploadService {

    @Value("${upload.dir}")
    String uploadDir;

    public UploadResult uploadFileResult(MultipartFile file, String fileName) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.matches("image/(png|jpeg|jpg|webp|gif)")) {
                return new UploadResult(false, null, "Chỉ cho phép tải lên các tệp tin ảnh (PNG, JPG, WEBP, GIF)");
            }
            
            // Lấy tên tệp tin trần (bỏ tất cả tiền tố thư mục dạng ../ hay C:\ để chống Path Traversal)
            String safeFileName = new File(fileName).getName();
            
            // Loại bỏ các ký tự lạ chỉ giữ lại chữ, số, chấm, gạch ngang, gạch dưới
            safeFileName = safeFileName.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
            
            File dir = new File(uploadDir).getAbsoluteFile();
            if (!dir.exists() && !dir.mkdirs()) {
                return new UploadResult(false, null, "Không thể tạo thư mục lưu trữ");
            }
            
            File serverFile = new File(dir, safeFileName);
            // Xác minh lại đường dẫn chuẩn hóa để chắc chắn không bị ghi đè ngoài thư mục uploadDir
            if (!serverFile.getCanonicalPath().startsWith(dir.getCanonicalPath())) {
                throw new SecurityException("Phát hiện hành vi tấn công Directory Traversal!");
            }
            
            file.transferTo(serverFile);
            return new UploadResult(true, "/uploads/" + safeFileName, null);
        } catch (Exception e) {
            log.error("Tải file thất bại", e);
            return new UploadResult(false, null, "Tải file thất bại: " + e.getMessage());
        }
    }
}
