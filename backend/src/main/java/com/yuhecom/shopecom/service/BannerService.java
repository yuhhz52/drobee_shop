package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.BannerDto;

import java.util.List;

public interface BannerService {
    List<BannerDto> getAllActive();
}
