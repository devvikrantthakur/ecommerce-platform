package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.ApiResponse;
import com.ecommerce.platform.dto.CartDto;
import com.ecommerce.platform.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getActiveCart(Authentication authentication) {
        String email = authentication.getName();
        CartDto cart = cartService.getActiveCartByUserEmail(email);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Active cart retrieved")
                .data(cart)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItemToCart(
            @RequestParam("productId") String productId,
            @RequestParam(name = "quantity", defaultValue = "1") Integer quantity,
            Authentication authentication) {
        String email = authentication.getName();
        CartDto cart = cartService.addItemToCart(email, productId, quantity);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Product added to cart successfully")
                .data(cart)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItemQuantity(
            @PathVariable("itemId") String itemId,
            @RequestParam("quantity") Integer quantity,
            Authentication authentication) {
        String email = authentication.getName();
        CartDto cart = cartService.updateCartItemQuantity(email, itemId, quantity);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Cart item quantity updated")
                .data(cart)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @PathVariable("itemId") String itemId, Authentication authentication) {
        String email = authentication.getName();
        CartDto cart = cartService.removeCartItem(email, itemId);
        ApiResponse<CartDto> response = ApiResponse.<CartDto>builder()
                .success(true)
                .message("Product removed from cart")
                .data(cart)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> clearCart(Authentication authentication) {
        String email = authentication.getName();
        cartService.clearCart(email);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Cart cleared successfully")
                .data("Cart empty")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
