package com.yuhecom.shopecom.service;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.yuhecom.shopecom.dto.UploadResult;

import java.io.File;
import java.io.IOException;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileUploadService {

    @Value("${upload.dir}")
    String uploadDir;

    public UploadResult uploadFileResult(MultipartFile file, String fileName) {
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File serverFile = new File(dir.getAbsolutePath() + File.separator + fileName);
            file.transferTo(serverFile);

            return new UploadResult(true, "/uploads/" + fileName, null);
        } catch (IOException e) {
            String message = e.getMessage() == null ? "Upload failed" : e.getMessage();
            return new UploadResult(false, null, message);
        }
    }
}
