package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.CartCheckoutValidation;
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

            // Verify variant is active
            if (!Boolean.TRUE.equals(variant.getActive())) {
                throw new AppException(ErrorCode.VARIANT_INACTIVE,
                        "This variant is not available: " + variant.getVariantName());
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
        // Note: Cart does NOT reserve stock. Multiple users can add the same product.
        // Stock validation ensures user doesn't request more than physically available.
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

        // Validate against stock (only for variants, products without variants have unlimited stock)
        if (variant != null && totalQty > variant.getStockQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Only %d items available", variant.getStockQuantity()));
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
                    throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                            String.format("Only %d items available", variant.getStockQuantity()));
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
                // Validate stock when merging
                if (target.getProductVariant() != null) {
                    int stock = target.getProductVariant().getStockQuantity();
                    if (newQty > stock) {
                        newQty = stock;
                    }
                }
                // Cap at max
                target.setQuantity(Math.min(newQty, MAX_QUANTITY_PER_ITEM));
            } else {
                int qtyToAdd = anonItem.getQuantity();
                // Validate stock when adding new item
                if (anonItem.getProductVariant() != null) {
                    int stock = anonItem.getProductVariant().getStockQuantity();
                    if (qtyToAdd > stock) {
                        qtyToAdd = stock;
                    }
                }
                if (qtyToAdd <= 0) {
                    continue; // Skip if out of stock
                }
                CartItem copy = CartItem.builder()
                        .product(anonItem.getProduct())
                        .productVariant(anonItem.getProductVariant())
                        .quantity(Math.min(qtyToAdd, MAX_QUANTITY_PER_ITEM))
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

    // ── Checkout Operations ────────────────────────────────────────────────────

    @Override
    @Transactional
    public Cart getCartForCheckout(User user, UUID cartId) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "User must be logged in to checkout");
        }

        Cart cart = cartRepository.findByIdAndUserIdForCheckout(cartId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND,
                        "Cart not found or does not belong to user"));

        if (cart.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY, "Cart is empty");
        }

        return cart;
    }

    @Override
    @Transactional(readOnly = true)
    public CartCheckoutValidation validateCartForCheckout(Cart cart) {
        List<CartCheckoutValidation.CartItemValidation> itemValidations = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : cart.getItems()) {
            int availableStock = Integer.MAX_VALUE;
            boolean inStock = true;
            boolean active = true;

            if (item.getProductVariant() != null) {
                ProductVariant variant = item.getProductVariant();
                availableStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                inStock = availableStock >= item.getQuantity();
                active = Boolean.TRUE.equals(variant.getActive());
            }

            // Check product active status
            if (!Boolean.TRUE.equals(item.getProduct().getActive())) {
                active = false;
            }

            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal subTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            itemValidations.add(CartCheckoutValidation.CartItemValidation.builder()
                    .productId(item.getProduct().getId())
                    .variantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null)
                    .productName(item.getProductSnapshotName())
                    .variantName(item.getVariantSnapshotName())
                    .quantity(item.getQuantity())
                    .availableStock(availableStock)
                    .unitPrice(unitPrice)
                    .subTotal(subTotal)
                    .inStock(inStock)
                    .active(active)
                    .build());

            if (inStock && active) {
                totalAmount = totalAmount.add(subTotal);
                totalItems += item.getQuantity();
            }
        }

        return CartCheckoutValidation.builder()
                .cartId(cart.getId())
                .items(itemValidations)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    @Override
    @Transactional
    public void clearCartAfterCheckout(UUID cartId) {
        Cart cart = cartRepository.findByIdForCheckout(cartId)
                .orElse(null);

        if (cart != null && !cart.getItems().isEmpty()) {
            cartItemRepository.deleteAll(new ArrayList<>(cart.getItems()));
            cart.getItems().clear();
            cartRepository.save(cart);
            log.info("Cleared cart after checkout: cartId={}", cartId);
        }
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
                .filter(item -> item != null)
                .map(this::toItemResponse)
                .filter(response -> response != null)
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
        if (item == null) {
            log.warn("Null CartItem encountered, skipping");
            return null;
        }
        
        BigDecimal unitPrice = item.getUnitPrice() != null 
                ? item.getUnitPrice() 
                : BigDecimal.ZERO;
        int quantity = item.getQuantity() > 0 ? item.getQuantity() : 1;
        BigDecimal subTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        
        UUID productId = null;
        if (item.getProduct() != null && item.getProduct().getId() != null) {
            productId = item.getProduct().getId();
        } else {
            log.warn("CartItem has null product, itemId={}", item.getId());
        }
        
        UUID variantId = null;
        if (item.getProductVariant() != null) {
            variantId = item.getProductVariant().getId();
        }
        
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(productId)
                .productName(item.getProductSnapshotName())
                .productSlug(item.getProductSnapshotSlug())
                .productImage(item.getProductSnapshotImage())
                .variantId(variantId)
                .variantName(item.getVariantSnapshotName())
                .variantColor(item.getVariantSnapshotColor())
                .quantity(quantity)
                .unitPrice(unitPrice)
                .subTotal(subTotal)
                .build();
    }
}
