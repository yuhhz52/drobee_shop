package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.BannerDto;
import com.yuhecom.shopecom.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getActiveBanners() {
        List<BannerDto> banners = bannerService.getAllActive();
        return ResponseEntity.ok(ApiResponse.<List<BannerDto>>builder().result(banners).build());
    }
}
