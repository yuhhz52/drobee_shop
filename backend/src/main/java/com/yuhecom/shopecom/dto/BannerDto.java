package com.yuhecom.shopecom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerDto {
    private UUID id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String altText;
    private Integer displayOrder;
    private Boolean active;
}
