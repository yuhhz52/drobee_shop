package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.BlogPostDto;
import com.yuhecom.shopecom.entity.BlogPost;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BlogPostMapper {
    BlogPostDto toDto(BlogPost blogPost);
    List<BlogPostDto> toDtoList(List<BlogPost> blogPosts);
}
