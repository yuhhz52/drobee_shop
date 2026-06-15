package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.entity.*;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.mapper.ProductMapper;
import com.yuhecom.shopecom.repository.ProductRepository;
import com.yuhecom.shopecom.repository.ProductVariantRepository;
import com.yuhecom.shopecom.service.CategoryService;
import com.yuhecom.shopecom.service.ProductService;
import com.yuhecom.shopecom.speciffication.ProductSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ProductServiceImpl implements ProductService {

    ProductRepository productRepository;
    CategoryService categoryService;
    ProductMapper productMapper;
    ProductVariantRepository productVariantRepository;


    @Override
    public Product addProducts(ProductDto productDto) {
        Product product = productMapper.toEntity(productDto);

        // Validate CategoryType belongs to Category (if provided)
        Category category = categoryService.getCategory(productDto.getCategoryId());
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
    @Transactional(readOnly = true)
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND,
                        "Product not found with slug: " + slug));
        initializeProductCollections(product);
        return productMapper.toDto(product);
    }

    private void initializeProductCollections(Product product) {
        if (product.getVariants() != null) {
            Hibernate.initialize(product.getVariants());
        }
        if (product.getResources() != null) {
            Hibernate.initialize(product.getResources());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProduct(UUID categoryId, List<UUID> typeIds, String name, Boolean newArrival,
                                         Integer minMaxSpeed, Integer minRange, Integer maxMotorPower,
                                         BigDecimal maxWeight, BigDecimal minBatteryCapacity,
                                         BigDecimal minBatteryVoltage, Boolean removableBattery,
                                         BigDecimal maxWheelSize, Integer minMaxLoad, Integer minMaxIncline,
                                         int page, int size) {
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

        if (minMaxSpeed != null) {
            spec = spec.and(ProductSpecification.hasMinMaxSpeed(minMaxSpeed));
        }
        if (minRange != null) {
            spec = spec.and(ProductSpecification.hasMinRange(minRange));
        }
        if (maxMotorPower != null) {
            spec = spec.and(ProductSpecification.hasMaxMotorPower(maxMotorPower));
        }
        if (maxWeight != null) {
            spec = spec.and(ProductSpecification.hasMaxWeight(maxWeight));
        }
        if (minBatteryCapacity != null) {
            spec = spec.and(ProductSpecification.hasMinBatteryCapacity(minBatteryCapacity));
        }
        if (minBatteryVoltage != null) {
            spec = spec.and(ProductSpecification.hasMinBatteryVoltage(minBatteryVoltage));
        }
        if (removableBattery != null) {
            spec = spec.and(ProductSpecification.hasRemovableBattery(removableBattery));
        }
        if (maxWheelSize != null) {
            spec = spec.and(ProductSpecification.hasMaxWheelSize(maxWheelSize));
        }
        if (minMaxLoad != null) {
            spec = spec.and(ProductSpecification.hasMinMaxLoad(minMaxLoad));
        }
        if (minMaxIncline != null) {
            spec = spec.and(ProductSpecification.hasMinMaxIncline(minMaxIncline));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        productPage.getContent().forEach(this::initializeProductCollections);
        return productPage.map(productMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public PagingResult<ProductDto> getProductsPage(UUID categoryId, List<UUID> typeIds, UUID typeId, String slug, String name,
                                                    Boolean newArrival, Integer minMaxSpeed, Integer minRange,
                                                    Integer maxMotorPower, BigDecimal maxWeight, BigDecimal minBatteryCapacity,
                                                    BigDecimal minBatteryVoltage, Boolean removableBattery,
                                                    BigDecimal maxWheelSize, Integer minMaxLoad, Integer minMaxIncline,
                                                    int page, int size) {
        if (StringUtils.isNotBlank(slug)) {
            ProductDto product = getProductBySlug(slug);
            return new PagingResult<>(List.of(product), "products 0-0/1");
        }

        List<UUID> resolvedTypeIds = typeIds == null ? new ArrayList<>() : new ArrayList<>(typeIds);
        if (typeId != null) {
            resolvedTypeIds.add(typeId);
        }

        Page<ProductDto> productPage = getAllProduct(
                categoryId, resolvedTypeIds, name, newArrival,
                minMaxSpeed, minRange, maxMotorPower, maxWeight,
                minBatteryCapacity, minBatteryVoltage, removableBattery,
                maxWheelSize, minMaxLoad, minMaxIncline, page, size);
        String contentRange = buildContentRange(page, size, productPage.getNumberOfElements(), productPage.getTotalElements());
        return new PagingResult<>(productPage.getContent(), contentRange);
    }

    private String buildContentRange(int page, int size, int itemCount, long totalElements) {
        int start = page * size;
        int end = totalElements == 0 ? 0 : Math.min(start + itemCount - 1, (int) totalElements - 1);
        return "products " + start + "-" + end + "/" + totalElements;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
        initializeProductCollections(product);
        if (product.getCategoryType() != null && product.getCategoryType().getCategory() != null) {
            product.getCategoryType().getCategory().getName();
        }
        if (product.getScooterSpec() != null) {
            product.getScooterSpec().getMotorPowerW();
        }
        return productMapper.toDto(product);
    }

    @Override
    public Product updateProduct(ProductDto productDto, UUID id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product Not Found!"));

        // 1. Tự động cập nhật các field từ DTO (bỏ qua các trường null) nhờ MapStruct
        productMapper.updateEntityFromDto(productDto, existingProduct);

        // 2. Nghiệp vụ đặc thù cho việc kiểm tra Category và CategoryType (nếu có cung cấp CategoryTypeId)
        if (productDto.getCategoryTypeId() != null) {
            Category category = productDto.getCategoryId() == null
                    ? existingProduct.getCategoryType().getCategory()
                    : categoryService.getCategory(productDto.getCategoryId());
            CategoryType categoryType = category.getCategoryTypes().stream()
                    .filter(ct -> ct.getId().equals(productDto.getCategoryTypeId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_TYPE_NOT_FOUND,
                            "Category Type not found in selected Category"));
            existingProduct.setCategoryType(categoryType);
        }

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

    @Override
    public ProductVariant fetchProductVariantByIdForUpdate(UUID id) {
        return productVariantRepository.findWithLockingById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, "ProductVariant not found"));
    }

}
