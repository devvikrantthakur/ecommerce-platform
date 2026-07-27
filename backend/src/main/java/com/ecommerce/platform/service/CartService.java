package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.CartDto;

public interface CartService {
    CartDto getActiveCartByUserEmail(String email);
    CartDto addItemToCart(String email, String productId, Integer quantity);
    CartDto updateCartItemQuantity(String email, String cartItemId, Integer quantity);
    CartDto removeCartItem(String email, String cartItemId);
    void clearCart(String email);
}
