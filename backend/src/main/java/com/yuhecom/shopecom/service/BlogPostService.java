package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.BlogPostDto;

import java.util.List;

public interface BlogPostService {
    List<BlogPostDto> getAllActive();
}
