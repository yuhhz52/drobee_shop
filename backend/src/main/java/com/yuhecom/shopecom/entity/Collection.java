package com.yuhecom.shopecom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "collections", indexes = {
    @Index(name = "idx_collections_slug_active", columnList = "slug, active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collection extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "category_type_id")
    private UUID categoryTypeId;

    @Builder.Default
    @Column(name = "is_all_products", nullable = false)
    private Boolean isAllProducts = false;

    @Builder.Default
    @Column(name = "is_new_arrivals", nullable = false)
    private Boolean isNewArrivals = false;

    @Builder.Default
    @Column(name = "is_sale", nullable = false)
    private Boolean isSale = false;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
