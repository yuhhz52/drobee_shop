package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.dto.ProductResourceDto;
import com.yuhecom.shopecom.dto.ProductVariantDto;
import com.yuhecom.shopecom.entity.*;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    List<ProductDto> toDtoList(List<Product> products);

    // DTO -> Entity
    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    @Mapping(target = "categoryType", source = "categoryTypeId", qualifiedByName = "idToCategoryType")
    @Mapping(source = "variants", target = "productVariantList")
    @Mapping(source = "productResources", target = "productResources")
    Product toEntity(ProductDto productDto);

    // Entity -> DTO
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "categoryType.id", target = "categoryTypeId")
    @Mapping(source = "categoryType.name", target = "categoryTypeName")
    @Mapping(source = "productVariantList", target = "variants")
    @Mapping(target = "thumbnail", expression = "java(getProductThumbnail(product.getProductResources()))")
    ProductDto toDto(Product product);

    // Map UUID -> Category
    @Named("idToCategory")
    default Category mapCategoryIdToCategory(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }
        Category category = new Category();
        category.setId(categoryId);
        return category;
    }

    // Map UUID -> CategoryType
    @Named("idToCategoryType")
    default CategoryType mapCategoryTypeIdToCategoryType(UUID categoryTypeId) {
        if (categoryTypeId == null) {
            return null;
        }
        CategoryType categoryType = new CategoryType();
        categoryType.setId(categoryTypeId);
        return categoryType;
    }

    // Lay anh product
    default String getProductThumbnail(List<ProductResource> resources) {
        if (resources == null || resources.isEmpty()) return null;
        return resources.stream()
                .filter(ProductResource::getIsPrimary)
                .map(ProductResource::getUrl)
                .findFirst()
                .orElse(null);
    }



    // Sau khi map xong DTO -> Entity, set quan hệ ngược cho resources và variants
    @AfterMapping
    default void linkProductRelations(@MappingTarget Product product) {
        if (product.getProductResources() != null) {
            product.getProductResources().forEach(r -> r.setProduct(product));
        }
        if (product.getProductVariantList() != null) {
            product.getProductVariantList().forEach(v -> v.setProduct(product));
        }
    }

}

// Sub mappings
//    List<ProductResource> toProductResources(List<ProductResourceDto> dtos);
//    List<ProductResourceDto> toProductResourceDtos(List<ProductResource> entities);
//
//    List<ProductVariant> toProductVariants(List<ProductVariantDto> dtos);
//    List<ProductVariantDto> toProductVariantDtos(List<ProductVariant> entities);
//
//    ProductVariantDto toProductVariantDto(ProductVariant variant);
//    ProductVariant toProductVariant(ProductVariantDto dto);
//
//    ProductResourceDto toProductResourceDto(ProductResource resource);
//    ProductResource toProductResource(ProductResourceDto dto);


//    @Autowired
//    private CategoryService categoryService;
//    public Product mapToProductEntity(ProductDto productDto, Product existingProduct) {
//        Product product = new Product();
//        if(null != productDto.getId()){
//            product.setId(productDto.getId());
//        }
//        product.setName(productDto.getName());
//        product.setDescription(productDto.getDescription());
//        product.setBrand(productDto.getBrand());
//        product.setNewArrival(productDto.getNewArrival());
//        product.setPrice(productDto.getPrice());
//        product.setRating(productDto.getRating());
//        product.setSlug(productDto.getSlug());
//
//        // Xử lý category
//        Category category = categoryService.getCategory(productDto.getCategoryId());
//        if(null != category){
//            product.setCategory(category);
//
//            // Xử lý categoryType - chỉ cập nhật nếu được gửi từ client
//            UUID categoryTypeId = productDto.getCategoryTypeId();
//            if (categoryTypeId != null) {
//                CategoryType categoryType = category.getCategoryTypes()
//                        .stream().filter(categoryType1 -> categoryType1.getId().equals(categoryTypeId)).findFirst().orElse(null);
//                product.setCategoryType(categoryType);
//            } else if (existingProduct != null) {
//                // Giữ nguyên categoryType hiện tại nếu không được gửi trong update
//                product.setCategoryType(existingProduct.getCategoryType());
//            }
//        } else if (existingProduct != null) {
//            // Giữ nguyên category và categoryType hiện tại nếu categoryId không được gửi
//            product.setCategory(existingProduct.getCategory());
//            product.setCategoryType(existingProduct.getCategoryType());
//        }
//
//        if(null != productDto.getVariants()){
//            product.setProductVariantList(mapToProductVariant(productDto.getVariants(),product));
//
//        }
//
//        if(null != productDto.getProductResources()){
//            product.setProductResources(mapToProductResource(productDto.getProductResources(),product));
//        }
//
//        return product;
//    }
//
//    public List<ProductResource> mapToProductResource(List<ProductResourceDto> productResources, Product product) {
//
//        return productResources.stream().map(productResourceDto ->
//        {
//            ProductResource resource = new ProductResource();
//            if(null != productResourceDto.getId()){
//                resource.setId(productResourceDto.getId());
//            }
//            resource.setName(productResourceDto.getName());
//            resource.setType(productResourceDto.getType());
//            resource.setUrl(productResourceDto.getUrl());
//            resource.setIsPrimary(productResourceDto.getIsPrimary());
//            resource.setProduct(product);
//            return resource;
//        }).collect(Collectors.toList());
//    }
//
//    public List<ProductVariant> mapToProductVariant(List<ProductVariantDto> productVariantDto, Product product){
//        return productVariantDto.stream().map(productVariantDto1 -> {
//            ProductVariant productVariant = new ProductVariant();
//            if(null != productVariantDto1.getId()){
//                productVariant.setId(productVariantDto1.getId());
//            }
//            productVariant.setColor(productVariantDto1.getColor());
//            productVariant.setSize(productVariantDto1.getSize());
//            productVariant.setStockQuantity(productVariantDto1.getStockQuantity());
//            productVariant.setProduct(product);
//            return productVariant;
//        }).collect(Collectors.toList());
//    }
//
//    public List<ProductDto> getProductDtos(List<Product> products) {
//        return products.stream().map(this::mapProductToDto).toList();
//    }
//    private String getProductThumbnail(List<ProductResource> resources) {
//        if (resources == null || resources.isEmpty()) return null;
//
//        return resources.stream()
//                .filter(ProductResource::getIsPrimary)
//                .findFirst()
//                .map(ProductResource::getUrl)
//                .orElse(null);
//    }
//
//    public List<ProductVariantDto> mapProductVariantListToDto(List<ProductVariant> productVariants) {
//        return productVariants.stream().map(this::mapProductVariantDto).toList();
//    }
//
//    private ProductVariantDto mapProductVariantDto(ProductVariant productVariant) {
//        return ProductVariantDto.builder()
//                .color(productVariant.getColor())
//                .id(productVariant.getId())
//                .size(productVariant.getSize())
//                .stockQuantity(productVariant.getStockQuantity())
//                .build();
//    }
//
//    public ProductDto mapProductToDto(Product product) {
//        UUID categoryTypeId = product.getCategoryType() != null ? product.getCategoryType().getId() : null;
//        String categoryTypeName = product.getCategoryType() != null ? product.getCategoryType().getName() : null;
//        return ProductDto.builder()
//                .id(product.getId())
//                .brand(product.getBrand())
//                .name(product.getName())
//                .price(product.getPrice())
//                .newArrival(product.isNewArrival())
//                .rating(product.getRating())
//                .description(product.getDescription())
//                .slug(product.getSlug())
//                .thumbnail(getProductThumbnail(product.getProductResources()))
//                .categoryId(product.getCategory().getId())
//                .categoryTypeId(categoryTypeId)
//                .categoryTypeName(categoryTypeName)
//                .build();
//    }
//
//    public List<ProductResourceDto> mapProductResourcesListDto(List<ProductResource> resources) {
//        return resources.stream().map(this::mapResourceToDto).toList();
//    }
//
//    private ProductResourceDto mapResourceToDto(ProductResource resources) {
//        return ProductResourceDto.builder()
//                .id(resources.getId())
//                .url(resources.getUrl())
//                .name(resources.getName())
//                .isPrimary(resources.getIsPrimary())
//                .type(resources.getType())
//                .build();
//    }









