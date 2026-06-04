package com.yuhecom.shopecom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryTypeDto {
    private UUID id;
    @NotBlank
    @Size(max = 255)
    private String name;
    @Size(max = 100)
    private String code;
    private String description;
    private CategoryDto category;
}
