package com.yuhecom.shopecom.dto;


import com.yuhecom.shopecom.entity.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResourceDto {

    private UUID id;
    private String name;
    private String url;
    private ResourceType type;
    private  Boolean isPrimary;
}