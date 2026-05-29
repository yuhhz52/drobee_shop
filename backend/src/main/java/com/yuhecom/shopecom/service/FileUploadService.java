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
            File dir = new File(uploadDir);
            log.info("File upload directory resolved: {}", dir.getAbsolutePath());
            if (!dir.exists() && !dir.mkdirs()) {
                log.error("Cannot create upload directory: {}", dir.getAbsolutePath());
                return new UploadResult(false, null, "Cannot create upload directory");
            }

            File serverFile = new File(dir.getAbsolutePath() + File.separator + fileName);
            log.info("Saving uploaded file to {}", serverFile.getAbsolutePath());
            file.transferTo(serverFile);

            log.info("File saved successfully: {}", serverFile.getAbsolutePath());
            return new UploadResult(true, "/uploads/" + fileName, null);
        } catch (Exception e) {
            String message = e.getMessage() == null ? "Upload failed" : e.getMessage();
            log.error("File upload failed for fileName={}. Reason={}", fileName, message, e);
            return new UploadResult(false, null, message);
        }
    }
}
