package com.yuhecom.shopecom.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_variants", indexes = {
    @Index(name = "idx_product_variants_product_id", columnList = "product_id"),
    @Index(name = "idx_product_variants_stock", columnList = "stock_quantity")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private String variantName;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal additionalPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable = false)
    @JsonIgnore
    private Product product;

}
