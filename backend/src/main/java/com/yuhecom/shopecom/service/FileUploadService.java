package com.yuhecom.shopecom.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileUploadService {

    @Value("${upload.dir}")
    String uploadDir;

    public String uploadFile(MultipartFile file, String fileName) {
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File serverFile = new File(dir.getAbsolutePath() + File.separator + fileName);
            file.transferTo(serverFile);

            return "/uploads/" + fileName; // Trả về URL tương đối để client hiển thị
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
