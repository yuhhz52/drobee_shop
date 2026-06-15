package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.CollectionDto;
import com.yuhecom.shopecom.mapper.CollectionMapper;
import com.yuhecom.shopecom.repository.CollectionRepository;
import com.yuhecom.shopecom.service.CollectionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CollectionServiceImpl implements CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionMapper collectionMapper;

    public CollectionServiceImpl(CollectionRepository collectionRepository, CollectionMapper collectionMapper) {
        this.collectionRepository = collectionRepository;
        this.collectionMapper = collectionMapper;
    }

    @Override
    public Optional<CollectionDto> getBySlug(String slug) {
        return collectionRepository.findBySlugAndActiveTrue(slug)
                .map(collectionMapper::toDto);
    }

    @Override
    public List<CollectionDto> getAllActive() {
        return collectionRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()) && c.getDeletedAt() == null)
                .map(collectionMapper::toDto)
                .collect(Collectors.toList());
    }
}
