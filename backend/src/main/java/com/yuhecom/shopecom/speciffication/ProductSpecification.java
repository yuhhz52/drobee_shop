package com.yuhecom.shopecom.speciffication;

import com.yuhecom.shopecom.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> hasCategoryId(UUID categoryId){
        return  (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("category").get("id"),categoryId);
    }

    public static Specification<Product> hasCategoryTypeId(UUID typeId){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("categoryType").get("id"),typeId);
    }

    public static Specification<Product> hasCategoryTypeIds(List<UUID> typeIds) {
        return (root, query, criteriaBuilder) -> root.get("categoryType").get("id").in(typeIds);
    }

    public static Specification<Product> hasNameLike(String name) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }
}
