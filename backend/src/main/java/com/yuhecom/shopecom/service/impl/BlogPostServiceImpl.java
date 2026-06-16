package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.BlogPostDto;
import com.yuhecom.shopecom.mapper.BlogPostMapper;
import com.yuhecom.shopecom.repository.BlogPostRepository;
import com.yuhecom.shopecom.service.BlogPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogPostServiceImpl implements BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final BlogPostMapper blogPostMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BlogPostDto> getAllActive() {
        log.info("Fetching all active blog posts");
        return blogPostMapper.toDtoList(blogPostRepository.findAllActiveOrderByDisplayOrder());
    }
}
