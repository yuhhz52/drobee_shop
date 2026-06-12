package com.yuhecom.shopecom.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_item_cart_id", columnList = "cart_id"),
    @Index(name = "idx_cart_item_product_id", columnList = "product_id"),
    @Index(name = "idx_cart_item_variant_id", columnList = "product_variant_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_cart_product_variant", columnNames = {"cart_id", "product_id", "product_variant_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "product_snapshot_name", length = 255)
    private String productSnapshotName;

    @Column(name = "product_snapshot_slug", length = 255)
    private String productSnapshotSlug;

    @Column(name = "product_snapshot_image", length = 500)
    private String productSnapshotImage;

    @Column(name = "variant_snapshot_name", length = 255)
    private String variantSnapshotName;

    @Column(name = "variant_snapshot_color", length = 100)
    private String variantSnapshotColor;
}
