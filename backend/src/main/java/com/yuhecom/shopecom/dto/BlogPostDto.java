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
public class BlogPostDto {
    private UUID id;
    private String title;
    private String excerpt;
    private String slug;
    private String imageUrl;
    private String authorName;
    private String metaInfo;
}
