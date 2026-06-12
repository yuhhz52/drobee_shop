package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.CartItemRequest;
import com.yuhecom.shopecom.dto.CartItemResponse;
import com.yuhecom.shopecom.dto.CartResponse;
import com.yuhecom.shopecom.entity.Cart;
import com.yuhecom.shopecom.entity.CartItem;
import com.yuhecom.shopecom.entity.Product;
import com.yuhecom.shopecom.entity.ProductResource;
import com.yuhecom.shopecom.entity.ProductVariant;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.reponsitory.CartItemRepository;
import com.yuhecom.shopecom.reponsitory.CartRepository;
import com.yuhecom.shopecom.reponsitory.ProductRepository;
import com.yuhecom.shopecom.reponsitory.ProductVariantRepository;
import com.yuhecom.shopecom.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    private static final int MAX_QUANTITY_PER_ITEM = 99;

    // ── Read Operations ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(User user, String sessionId) {
        Cart cart = resolveCartReadOnly(user, sessionId);
        return toResponse(cart);
    }

    // ── Write Operations (Pessimistic Lock) ───────────────────────────────────

    @Override
    @Transactional
    public CartResponse addItem(User user, String sessionId, CartItemRequest request) {
        Cart cart = resolveCartForUpdate(user, sessionId);

        // ── ① Validate product exists & active ──────────────────────────────
        Product product = productRepository.findByIdWithResources(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND,
                        "Product not found: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Product is no longer available: " + product.getName());
        }

        // ── ② Validate variant ─────────────────────────────────────────────
        ProductVariant variant = null;
        BigDecimal unitPrice;
        String variantName = null;
        String variantColor = null;

        if (request.getVariantId() != null) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND,
                            "Variant not found: " + request.getVariantId()));

            // Verify variant belongs to the correct product
            if (!variant.getProduct().getId().equals(request.getProductId())) {
                throw new AppException(ErrorCode.BAD_REQUEST,
                        "Variant does not belong to this product");
            }

            // Verify variant has stock
            if (variant.getStockQuantity() == null || variant.getStockQuantity() <= 0) {
                throw new AppException(ErrorCode.OUT_OF_STOCK,
                        "This variant is out of stock: " + variant.getVariantName());
            }

            // Calculate price: base price + additional price
            BigDecimal basePrice = product.getSalePrice() != null
                    ? product.getSalePrice() : product.getPrice();
            unitPrice = variant.getAdditionalPrice() != null
                    ? basePrice.add(variant.getAdditionalPrice())
                    : basePrice;
            variantName = variant.getVariantName();
            variantColor = variant.getColor();
        } else {
            unitPrice = product.getSalePrice() != null
                    ? product.getSalePrice() : product.getPrice();
        }

        // ── ③ Validate stock for requested quantity ─────────────────────────
        int requestedQty = request.getQuantity();
        int existingQty = cart.getItems().stream()
                .filter(i -> sameItem(i, request.getProductId(), request.getVariantId()))
                .mapToInt(CartItem::getQuantity)
                .sum();
        int totalQty = existingQty + requestedQty;

        if (totalQty > MAX_QUANTITY_PER_ITEM) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Maximum quantity per item is " + MAX_QUANTITY_PER_ITEM);
        }

        if (totalQty > (variant != null ? variant.getStockQuantity() : Integer.MAX_VALUE)) {
            throw new AppException(ErrorCode.OUT_OF_STOCK,
                    "Requested quantity exceeds available stock. Available: "
                            + (variant != null ? variant.getStockQuantity() : "unlimited"));
        }

        // ── ④ Find or create CartItem (deduplication) ──────────────────────
        String productImage = product.getResources() != null
                ? product.getResources().stream()
                        .filter(r -> "IMAGE".equals(r.getType().name()))
                        .findFirst()
                        .map(ProductResource::getUrl)
                        .orElse(null)
                : null;

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> sameItem(i, request.getProductId(), request.getVariantId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(totalQty);
        } else {
            CartItem item = CartItem.builder()
                    .product(product)
                    .productVariant(variant)
                    .quantity(requestedQty)
                    .unitPrice(unitPrice)
                    .productSnapshotName(product.getName())
                    .productSnapshotSlug(product.getSlug())
                    .productSnapshotImage(productImage)
                    .variantSnapshotName(variantName)
                    .variantSnapshotColor(variantColor)
                    .build();
            cart.addItem(item);
        }

        cartRepository.save(cart);
        log.info("Added to cart: product={}, variant={}, qty={}, cartId={}",
                product.getName(), variantName, requestedQty, cart.getId());
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(User user, String sessionId,
            UUID itemId, int quantity) {
        Cart cart = resolveCartForUpdate(user, sessionId);

        // Verify item belongs to this cart
        CartItem item = findItemInCart(cart, itemId);

        if (quantity <= 0) {
            // Remove item when quantity is 0
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            // Validate against max quantity
            if (quantity > MAX_QUANTITY_PER_ITEM) {
                throw new AppException(ErrorCode.BAD_REQUEST,
                        "Maximum quantity per item is " + MAX_QUANTITY_PER_ITEM);
            }

            // Validate against stock
            if (item.getProductVariant() != null) {
                ProductVariant variant = item.getProductVariant();
                if (quantity > variant.getStockQuantity()) {
                    throw new AppException(ErrorCode.OUT_OF_STOCK,
                            "Requested quantity exceeds available stock. Available: "
                                    + variant.getStockQuantity());
                }
            }

            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        log.info("Updated cart item: itemId={}, newQty={}, cartId={}", itemId, quantity, cart.getId());
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(User user, String sessionId, UUID itemId) {
        Cart cart = resolveCartForUpdate(user, sessionId);

        CartItem item = findItemInCart(cart, itemId);
        cart.removeItem(item);
        cartItemRepository.delete(item);

        cartRepository.save(cart);
        log.info("Removed cart item: itemId={}, cartId={}", itemId, cart.getId());
        return toResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(User user, String sessionId) {
        Cart cart = resolveCartForUpdate(user, sessionId);

        // Explicitly delete items to ensure orphanRemoval works correctly
        if (!cart.getItems().isEmpty()) {
            cartItemRepository.deleteAll(new ArrayList<>(cart.getItems()));
            cart.getItems().clear();
        }

        cartRepository.save(cart);
        log.info("Cleared cart: cartId={}", cart.getId());
    }

    @Override
    @Transactional
    public CartResponse mergeAnonymousCart(User user, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return getCart(user, null);
        }

        // Lock both carts to prevent concurrent modifications during merge
        Cart userCart = resolveUserCartForUpdate(user);
        Cart anonymousCart = resolveAnonymousCartForUpdate(sessionId);

        if (anonymousCart == null || anonymousCart.getItems().isEmpty()) {
            return toResponse(userCart);
        }

        // Merge items: sum quantity for duplicates, add new items
        for (CartItem anonItem : anonymousCart.getItems()) {
            Optional<CartItem> existing = userCart.getItems().stream()
                    .filter(i -> sameItem(i,
                            anonItem.getProduct().getId(),
                            anonItem.getProductVariant() != null
                                    ? anonItem.getProductVariant().getId() : null))
                    .findFirst();

            if (existing.isPresent()) {
                CartItem target = existing.get();
                int newQty = target.getQuantity() + anonItem.getQuantity();
                // Cap at max
                target.setQuantity(Math.min(newQty, MAX_QUANTITY_PER_ITEM));
            } else {
                CartItem copy = CartItem.builder()
                        .product(anonItem.getProduct())
                        .productVariant(anonItem.getProductVariant())
                        .quantity(Math.min(anonItem.getQuantity(), MAX_QUANTITY_PER_ITEM))
                        .unitPrice(anonItem.getUnitPrice())
                        .productSnapshotName(anonItem.getProductSnapshotName())
                        .productSnapshotSlug(anonItem.getProductSnapshotSlug())
                        .productSnapshotImage(anonItem.getProductSnapshotImage())
                        .variantSnapshotName(anonItem.getVariantSnapshotName())
                        .variantSnapshotColor(anonItem.getVariantSnapshotColor())
                        .build();
                userCart.addItem(copy);
            }
        }

        // Save user cart first, then delete anonymous cart
        cartRepository.save(userCart);
        cartRepository.delete(anonymousCart);

        log.info("Merged anonymous cart into user cart: userId={}, sessionId={}, "
                + "itemsMerged={}", user.getId(), sessionId, anonymousCart.getItems().size());
        return toResponse(userCart);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Read-only cart resolution (no lock).
     * Returns null if cart doesn't exist — caller decides how to handle.
     */
    private Cart resolveCartReadOnly(User user, String sessionId) {
        if (user != null) {
            return cartRepository.findByUserIdWithItemsReadOnly(user.getId()).orElse(null);
        }
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }
        return cartRepository.findBySessionIdWithItemsReadOnly(sessionId).orElse(null);
    }

    /**
     * Resolves cart for update operations (with pessimistic lock).
     * Creates a new cart if it doesn't exist.
     */
    private Cart resolveCartForUpdate(User user, String sessionId) {
        if (user != null) {
            return resolveUserCartForUpdate(user);
        }
        if (sessionId == null || sessionId.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Anonymous users require a valid session ID");
        }
        return resolveAnonymousCartForUpdate(sessionId);
    }

    private Cart resolveUserCartForUpdate(User user) {
        return cartRepository.findByUserIdWithItemsForUpdate(user.getId())
                .orElseGet(() -> {
                    Cart c = Cart.builder().user(user).items(new ArrayList<>()).build();
                    return cartRepository.save(c);
                });
    }

    private Cart resolveAnonymousCartForUpdate(String sessionId) {
        return cartRepository.findBySessionIdWithItemsForUpdate(sessionId)
                .orElseGet(() -> {
                    Cart c = Cart.builder().sessionId(sessionId).items(new ArrayList<>()).build();
                    return cartRepository.save(c);
                });
    }

    /**
     * Finds a CartItem by ID within a given cart.
     * Throws FORBIDDEN if item doesn't belong to this cart.
     */
    private CartItem findItemInCart(Cart cart, UUID itemId) {
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND,
                        "Cart item not found: " + itemId));

        // Ownership verification: item's cart must be the same as our cart
        if (item.getCart() == null || !item.getCart().getId().equals(cart.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN,
                    "Item does not belong to your cart");
        }

        return item;
    }

    /**
     * Checks if two cart items refer to the same product+variant combination.
     */
    private boolean sameItem(CartItem item, UUID productId, UUID variantId) {
        boolean productMatch = item.getProduct().getId().equals(productId);
        boolean variantMatch = variantId == null
                ? item.getProductVariant() == null
                : item.getProductVariant() != null
                        && item.getProductVariant().getId().equals(variantId);
        return productMatch && variantMatch;
    }

    // ── Response mapping ───────────────────────────────────────────────────────

    private CartResponse toResponse(Cart cart) {
        if (cart == null) {
            return CartResponse.builder()
                    .items(List.of())
                    .totalItems(0)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
        }

        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalItems(itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum())
                .totalAmount(total)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        BigDecimal subTotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductSnapshotName())
                .productSlug(item.getProductSnapshotSlug())
                .productImage(item.getProductSnapshotImage())
                .variantId(item.getProductVariant() != null
                        ? item.getProductVariant().getId() : null)
                .variantName(item.getVariantSnapshotName())
                .variantColor(item.getVariantSnapshotColor())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subTotal(subTotal)
                .build();
    }
}
