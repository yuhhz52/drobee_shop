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
        if (productDto.getShortDescription() != null) {
            existingProduct.setShortDescription(productDto.getShortDescription());
        }
        if (productDto.getPrice() != null) {
            existingProduct.setPrice(productDto.getPrice());
        }
        if (productDto.getSalePrice() != null) {
            existingProduct.setSalePrice(productDto.getSalePrice());
        }
        if (productDto.getBrand() != null) {
            existingProduct.setBrand(productDto.getBrand());
        }
        if (productDto.getRating() != null) {
            existingProduct.setRating(productDto.getRating());
        }
        if (productDto.getTotalSold() != null) {
            existingProduct.setTotalSold(productDto.getTotalSold());
        }
        if (productDto.getFeatured() != null) {
            existingProduct.setFeatured(productDto.getFeatured());
        }
        if (productDto.getNewArrival() != null) {
            existingProduct.setNewArrival(productDto.getNewArrival());
        }
        if (productDto.getActive() != null) {
            existingProduct.setActive(productDto.getActive());
        }
        if (productDto.getSku() != null) {
            existingProduct.setSku(productDto.getSku());
        }

        ScooterSpec scooterSpec = ensureScooterSpec(existingProduct);
        if (productDto.getMotorPowerW() != null) {
            scooterSpec.setMotorPowerW(productDto.getMotorPowerW());
        }
        if (productDto.getPeakPowerW() != null) {
            scooterSpec.setPeakPowerW(productDto.getPeakPowerW());
        }
        if (productDto.getMaxSpeedKmh() != null) {
            scooterSpec.setMaxSpeedKmh(productDto.getMaxSpeedKmh());
        }
        if (productDto.getMaxSpeedUnlockedKmh() != null) {
            scooterSpec.setMaxSpeedUnlockedKmh(productDto.getMaxSpeedUnlockedKmh());
        }
        if (productDto.getRangeKm() != null) {
            scooterSpec.setRangeKm(productDto.getRangeKm());
        }
        if (productDto.getMaxInclinePercent() != null) {
            scooterSpec.setMaxInclinePercent(productDto.getMaxInclinePercent());
        }
        if (productDto.getBatteryCapacityAh() != null) {
            scooterSpec.setBatteryCapacityAh(productDto.getBatteryCapacityAh());
        }
        if (productDto.getBatteryVoltageV() != null) {
            scooterSpec.setBatteryVoltageV(productDto.getBatteryVoltageV());
        }
        if (productDto.getBatteryType() != null) {
            scooterSpec.setBatteryType(productDto.getBatteryType());
        }
        if (productDto.getChargingTimeHours() != null) {
            scooterSpec.setChargingTimeHours(productDto.getChargingTimeHours());
        }
        if (productDto.getRemovableBattery() != null) {
            scooterSpec.setRemovableBattery(productDto.getRemovableBattery());
        }
        if (productDto.getWeightKg() != null) {
            scooterSpec.setWeightKg(productDto.getWeightKg());
        }
        if (productDto.getMaxLoadKg() != null) {
            scooterSpec.setMaxLoadKg(productDto.getMaxLoadKg());
        }
        if (productDto.getFrameMaterial() != null) {
            scooterSpec.setFrameMaterial(productDto.getFrameMaterial());
        }
        if (productDto.getWheelSizeInch() != null) {
            scooterSpec.setWheelSizeInch(productDto.getWheelSizeInch());
        }
        if (productDto.getTireType() != null) {
            scooterSpec.setTireType(productDto.getTireType());
        }
        if (productDto.getBrakeFront() != null) {
            scooterSpec.setBrakeFront(productDto.getBrakeFront());
        }
        if (productDto.getBrakeRear() != null) {
            scooterSpec.setBrakeRear(productDto.getBrakeRear());
        }
        if (productDto.getSuspensionFront() != null) {
            scooterSpec.setSuspensionFront(productDto.getSuspensionFront());
        }
        if (productDto.getSuspensionRear() != null) {
            scooterSpec.setSuspensionRear(productDto.getSuspensionRear());
        }
        if (productDto.getLengthCm() != null) {
            scooterSpec.setLengthCm(productDto.getLengthCm());
        }
        if (productDto.getWidthCm() != null) {
            scooterSpec.setWidthCm(productDto.getWidthCm());
        }
        if (productDto.getHeightCm() != null) {
            scooterSpec.setHeightCm(productDto.getHeightCm());
        }
        if (productDto.getFoldedLengthCm() != null) {
            scooterSpec.setFoldedLengthCm(productDto.getFoldedLengthCm());
        }
        if (productDto.getFoldedWidthCm() != null) {
            scooterSpec.setFoldedWidthCm(productDto.getFoldedWidthCm());
        }
        if (productDto.getFoldedHeightCm() != null) {
            scooterSpec.setFoldedHeightCm(productDto.getFoldedHeightCm());
        }
        if (productDto.getLights() != null) {
            scooterSpec.setLights(productDto.getLights());
        }
        if (productDto.getDisplayType() != null) {
            scooterSpec.setDisplayType(productDto.getDisplayType());
        }
        if (productDto.getConnectivity() != null) {
            scooterSpec.setConnectivity(productDto.getConnectivity());
        }
        if (productDto.getWaterResistanceRating() != null) {
            scooterSpec.setWaterResistanceRating(productDto.getWaterResistanceRating());
        }
        if (productDto.getCertifications() != null) {
            scooterSpec.setCertifications(productDto.getCertifications());
        }
        if (productDto.getWarrantyMonths() != null) {
            scooterSpec.setWarrantyMonths(productDto.getWarrantyMonths());
        }

        if (productDto.getSlug() != null) {
            existingProduct.setSlug(productDto.getSlug());
        }

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

        // updatedAt sẽ tự cập nhật nhờ @PreUpdate
        return productRepository.save(existingProduct);
    }

    private ScooterSpec ensureScooterSpec(Product product) {
        if (product.getScooterSpec() == null) {
            ScooterSpec scooterSpec = new ScooterSpec();
            scooterSpec.setProduct(product);
            product.setScooterSpec(scooterSpec);
        }
        return product.getScooterSpec();
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
