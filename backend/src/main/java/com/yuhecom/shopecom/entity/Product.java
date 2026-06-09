package com.yuhecom.shopecom.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_products_category_type_id", columnList = "category_type_id"),
    @Index(name = "idx_products_brand", columnList = "brand"),
    @Index(name = "idx_products_active", columnList = "active"),
    @Index(name = "idx_products_new_arrival", columnList = "new_arrival"),
    @Index(name = "idx_products_featured", columnList = "featured"),
    @Index(name = "idx_products_slug", columnList = "slug")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false)
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column
    private Integer totalSold;

    @Column
    private Boolean featured;

    @Column(nullable = false)
    private Boolean newArrival;

    @Column
    private Boolean active;

    @Column(unique = true)
    private String sku;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ScooterSpec scooterSpec;

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductVariant> variants;

    @org.hibernate.annotations.BatchSize(size = 20)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductResource> resources;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_type_id", nullable = false)
    @JsonIgnore
    private CategoryType categoryType;

}
