package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.CollectionDto;

import java.util.List;

public interface CollectionService {
    java.util.Optional<CollectionDto> getBySlug(String slug);
    List<CollectionDto> getAllActive();
}
