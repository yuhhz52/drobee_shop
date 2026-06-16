package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.BannerDto;
import com.yuhecom.shopecom.mapper.BannerMapper;
import com.yuhecom.shopecom.repository.BannerRepository;
import com.yuhecom.shopecom.service.BannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BannerDto> getAllActive() {
        log.info("Fetching all active banners");
        return bannerMapper.toDtoList(bannerRepository.findAllActiveOrderByDisplayOrder());
    }
}
