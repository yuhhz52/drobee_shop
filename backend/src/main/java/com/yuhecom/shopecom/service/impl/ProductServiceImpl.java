package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.entity.*;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.mapper.ProductMapper;
import com.yuhecom.shopecom.reponsitory.ProductRepository;
import com.yuhecom.shopecom.reponsitory.ProductVariantRepository;
import com.yuhecom.shopecom.service.CategoryService;
import com.yuhecom.shopecom.service.ProductService;
import com.yuhecom.shopecom.speciffication.ProductSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

        if (productDto.getCategoryTypeId() != null && category.getCategoryTypes() != null) {
            CategoryType categoryType = category.getCategoryTypes().stream()
                    .filter(ct -> ct.getId().equals(productDto.getCategoryTypeId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_TYPE_NOT_FOUND,
                            "Category type not found with id " + productDto.getCategoryTypeId()));
            product.setCategoryType(categoryType);
        }

        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(UUID productId) {
        productRepository.deleteById(productId);
    }

    @Override
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug);
        if (product == null) {
            throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found");
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

    @Override
    public PagingResult<ProductDto> getProductsPage(UUID categoryId, List<UUID> typeIds, UUID typeId, String slug, String name,
                                                    Boolean newArrival, int page, int size) {
        if (StringUtils.isNotBlank(slug)) {
            ProductDto product = getProductBySlug(slug);
            return new PagingResult<>(List.of(product), "products 0-0/1");
        }

        List<UUID> resolvedTypeIds = typeIds == null ? new ArrayList<>() : new ArrayList<>(typeIds);
        if (typeId != null) {
            resolvedTypeIds.add(typeId);
        }

        Page<ProductDto> productPage = getAllProduct(categoryId, resolvedTypeIds, name, newArrival, page, size);
        String contentRange = buildContentRange(page, size, productPage.getNumberOfElements(), productPage.getTotalElements());
        return new PagingResult<>(productPage.getContent(), contentRange);
    }

    private String buildContentRange(int page, int size, int itemCount, long totalElements) {
        int start = page * size;
        int end = totalElements == 0 ? 0 : Math.min(start + itemCount - 1, (int) totalElements - 1);
        return "products " + start + "-" + end + "/" + totalElements;
    }

    @Override
    public ProductDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
        return productMapper.toDto(product);
    }

    @Override
    public Product updateProduct(ProductDto productDto, UUID id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product Not Found!"));

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
                        .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_TYPE_NOT_FOUND, "Category Type not found in selected Category"));
                existingProduct.setCategoryType(categoryType);
            }
        }

        // updatedAt sẽ tự cập nhật nhờ @PreUpdate
        return productRepository.save(existingProduct);
    }


    @Override
    public Product fetchProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
    }

    @Override
    public ProductVariant fetchProductVariantById(UUID id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, "ProductVariant not found"));
    }

}
