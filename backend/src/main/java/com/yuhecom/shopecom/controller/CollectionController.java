package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CollectionDto;
import com.yuhecom.shopecom.service.CollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollectionDto>>> getAllCollections() {
        List<CollectionDto> collections = collectionService.getAllActive();
        return ResponseEntity.ok(ApiResponse.<List<CollectionDto>>builder().result(collections).build());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CollectionDto>> getBySlug(@PathVariable String slug) {
        return collectionService.getBySlug(slug)
                .map(c -> ResponseEntity.ok(ApiResponse.<CollectionDto>builder().result(c).build()))
                .orElse(ResponseEntity.notFound().build());
    }
}
