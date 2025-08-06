package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.entity.*;
import com.yuhecom.shopecom.exception.ResourceNotFoundEx;
import com.yuhecom.shopecom.mapper.ProductMapper;
import com.yuhecom.shopecom.reponsitory.ProductRepository;
import com.yuhecom.shopecom.service.CategoryService;
import com.yuhecom.shopecom.service.ProductService;
import com.yuhecom.shopecom.speciffication.ProductSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

    @Override
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug);
        if(null == product){
            throw new ResourceNotFoundEx("Product not found");
        }
        ProductDto dto = productMapper.toDto(product);
        dto.setVariants(productMapper.toProductVariantDtos(product.getProductVariantList()));
        dto.setProductResources(productMapper.toProductResourceDtos(product.getProductResources()));
        return dto;
    }

    @Override
    public List<ProductDto> getAllProduct(UUID categoryId, List<UUID> typeIds, String name) {
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

        List<Product> products = productRepository.findAll(spec);
        return productMapper.toDtoList(products);
    }

    @Override
    public ProductDto getProductById(UUID id) {
        Product product= productRepository.findById(id).orElseThrow(()-> new ResourceNotFoundEx("Product Not Found!"));
        if(null == product){
            throw new ResourceNotFoundEx("Product not found");
        }

        ProductDto dto = productMapper.toDto(product);
        dto.setVariants(productMapper.toProductVariantDtos(product.getProductVariantList()));
        dto.setProductResources(productMapper.toProductResourceDtos(product.getProductResources()));
        return dto;
    }

    @Override
    public Product updateProduct(ProductDto productDto, UUID id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product Not Found!"));

        Product product = productMapper.toEntity(productDto);
        // Giữ nguyên ID
        product.setId(existingProduct.getId());

        // Thiết lập lại category và categoryType
        Category category = categoryService.getCategory(productDto.getCategoryId());
        product.setCategory(category);

        if (productDto.getCategoryTypeId() != null) {
            CategoryType categoryType = category.getCategoryTypes().stream()
                    .filter(ct -> ct.getId().equals(productDto.getCategoryTypeId()))
                    .findFirst()
                    .orElse(null);
            product.setCategoryType(categoryType);
        } else {
            product.setCategoryType(existingProduct.getCategoryType());
        }

        return productRepository.save(product);
    }

    @Override
    public Product fetchProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundEx("Product not found"));
    }

}










