package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.UploadResult;
import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {

    UploadResult uploadFileResult(MultipartFile file, String fileName);
}
