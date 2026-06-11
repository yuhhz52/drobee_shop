package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.UploadResult;
import com.yuhecom.shopecom.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileUpload {

    private final FileUploadService fileUploadService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileName") String fileName) {

        UploadResult result = fileUploadService.uploadFileResult(file, fileName);

        if (result.success()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<String>builder().result(result.url()).build());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<String>builder().message(result.message()).result(null).build());
    }
}
