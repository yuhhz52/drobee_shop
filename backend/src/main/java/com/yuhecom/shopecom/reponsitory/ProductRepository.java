package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    @Override
    @EntityGraph(attributePaths = {"categoryType", "categoryType.category", "scooterSpec"})
    org.springframework.data.domain.Page<Product> findAll(
            org.springframework.data.jpa.domain.Specification<Product> spec,
            org.springframework.data.domain.Pageable pageable
    );

    /**
     * Fetch scalar associations only. Lists (variants, resources) are loaded separately
     * to avoid Hibernate MultipleBagFetchException.
     */
    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.categoryType ct
            LEFT JOIN FETCH ct.category
            LEFT JOIN FETCH p.scooterSpec
            WHERE p.slug = :slug
            """)
    Optional<Product> findBySlug(@Param("slug") String slug);

    Optional<Product> findBySku(String sku);
}
