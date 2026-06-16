package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.BannerDto;
import com.yuhecom.shopecom.entity.Banner;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BannerMapper {
    BannerDto toDto(Banner banner);
    List<BannerDto> toDtoList(List<Banner> banners);
}
