package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.entity.CategoryType;
import com.yuhecom.shopecom.entity.Product;
import com.yuhecom.shopecom.entity.ProductResource;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.UUID;

@Mapper(
        componentModel = "spring",
        uses = {ProductVariantMapper.class, ProductResourceMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProductMapper {

    List<ProductDto> toDtoList(List<Product> products);

    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    @Mapping(target = "categoryType", source = "categoryTypeId", qualifiedByName = "idToCategoryType")
    @Mapping(source = "variants", target = "productVariantList")
    Product toEntity(ProductDto productDto);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "categoryType.id", target = "categoryTypeId")
    @Mapping(source = "categoryType.name", target = "categoryTypeName")
    @Mapping(source = "productVariantList", target = "variants")
    @Mapping(target = "thumbnail", expression = "java(getProductThumbnail(product.getProductResources()))")
    ProductDto toDto(Product product);

    @Named("idToCategory")
    default Category mapCategoryIdToCategory(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }
        Category category = new Category();
        category.setId(categoryId);
        return category;
    }

    @Named("idToCategoryType")
    default CategoryType mapCategoryTypeIdToCategoryType(UUID categoryTypeId) {
        if (categoryTypeId == null) {
            return null;
        }
        CategoryType categoryType = new CategoryType();
        categoryType.setId(categoryTypeId);
        return categoryType;
    }

    default String getProductThumbnail(List<ProductResource> resources) {
        if (resources == null || resources.isEmpty()) {
            return null;
        }
        return resources.stream()
                .filter(ProductResource::getIsPrimary)
                .map(ProductResource::getUrl)
                .findFirst()
                .orElse(null);
    }

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
