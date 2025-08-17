package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.entity.*;
import com.yuhecom.shopecom.exception.ResourceNotFoundEx;
import com.yuhecom.shopecom.mapper.ProductMapper;
import com.yuhecom.shopecom.reponsitory.ProductRepository;
import com.yuhecom.shopecom.reponsitory.ProductVariantRepository;
import com.yuhecom.shopecom.service.CategoryService;
import com.yuhecom.shopecom.service.ProductService;
import com.yuhecom.shopecom.speciffication.ProductSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductServiceImpl implements ProductService {

    ProductRepository productRepository;
    CategoryService categoryService;
    ProductMapper productMapper;
    ProductVariantRepository productVariantRepository;


    @Override
    public Product addProducts(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);

        // Thiết lập Category và CategoryType
        Category category = categoryService.getCategory(productDto.getCategoryId());
        product.setCategory(category);

        if (productDto.getCategoryTypeId() != null) {
            CategoryType categoryType = category.getCategoryTypes().stream()
                    .filter(ct -> ct.getId().equals(productDto.getCategoryTypeId()))
                    .findFirst()
                    .orElse(null);
            product.setCategoryType(categoryType);
        }

        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(UUID productId) {
        productRepository.deleteById(productId);
    }

//    @Override
//    public ProductDto getProductBySlug(String slug) {
//        Product product = productRepository.findBySlug(slug);
//        if(null == product){
//            throw new ResourceNotFoundEx("Product not found");
//        }
//        ProductDto dto = productMapper.toDto(product);
//        dto.setVariants(productMapper.toProductVariantDtos(product.getProductVariantList()));
//        dto.setProductResources(productMapper.toProductResourceDtos(product.getProductResources()));
//        return dto;
//    }

    @Override
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug);
        if (product == null) {
            throw new ResourceNotFoundEx("Product not found");
        }
        return productMapper.toDto(product);
    }

    @Override
    public Page<ProductDto> getAllProduct(UUID categoryId, List<UUID> typeIds, String name, Boolean newArrival, int page, int size) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (categoryId != null) {
            spec = spec.and(ProductSpecification.hasCategoryId(categoryId));
        }

        if (typeIds != null && !typeIds.isEmpty()) {
            spec = spec.and(ProductSpecification.hasCategoryTypeIds(typeIds));
        }

        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and(ProductSpecification.hasNameLike(name));
        }

        if (newArrival != null) {
            spec = spec.and(ProductSpecification.hasNewArrival(newArrival));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        // Map entity → DTO và giữ nguyên thông tin phân trang
        return productPage.map(productMapper::toDto);
    }


//    @Override
//    public ProductDto getProductById(UUID id) {
//        Product product= productRepository.findById(id).orElseThrow(()-> new ResourceNotFoundEx("Product Not Found!"));
//        if(null == product){
//            throw new ResourceNotFoundEx("Product not found");
//        }
//
//        ProductDto dto = productMapper.toDto(product);
//        dto.setVariants(productMapper.toProductVariantDtos(product.getProductVariantList()));
//        dto.setProductResources(productMapper.toProductResourceDtos(product.getProductResources()));
//        return dto;
//    }

    @Override
    public ProductDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product not found"));
        return productMapper.toDto(product);
    }

    @Override
    public Product updateProduct(ProductDto productDto, UUID id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product Not Found!"));

        // Cập nhật các field có trong DTO (chỉ ghi đè khi DTO không null)
        if (productDto.getName() != null) {
            existingProduct.setName(productDto.getName());
        }
        if (productDto.getDescription() != null) {
            existingProduct.setDescription(productDto.getDescription());
        }
        if (productDto.getPrice() != null) {
            existingProduct.setPrice(productDto.getPrice());
        }
        if (productDto.getBrand() != null) {
            existingProduct.setBrand(productDto.getBrand());
        }
        if (productDto.getRating() != null) {
            existingProduct.setRating(productDto.getRating());
        }
        existingProduct.setNewArrival(productDto.getNewArrival());
        if (productDto.getSlug() != null) {
            existingProduct.setSlug(productDto.getSlug());
        }

        // Cập nhật Category
        if (productDto.getCategoryId() != null) {
            Category category = categoryService.getCategory(productDto.getCategoryId());
            existingProduct.setCategory(category);

            // Cập nhật CategoryType
            if (productDto.getCategoryTypeId() != null) {
                CategoryType categoryType = category.getCategoryTypes().stream()
                        .filter(ct -> ct.getId().equals(productDto.getCategoryTypeId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundEx("Category Type not found in selected Category"));
                existingProduct.setCategoryType(categoryType);
            }
        }

        // updatedAt sẽ tự cập nhật nhờ @PreUpdate
        return productRepository.save(existingProduct);
    }


    @Override
    public Product fetchProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product not found"));
    }

    @Override
    public ProductVariant fetchProductVariantById(UUID id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("ProductVariant not found"));
    }

}










