package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.ApiResponse;
import com.ecommerce.platform.dto.CheckoutRequest;
import com.ecommerce.platform.dto.OrderDto;
import com.ecommerce.platform.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(
            @Valid @RequestBody CheckoutRequest checkoutRequest, Authentication authentication) {
        String email = authentication.getName();
        OrderDto order = orderService.placeOrder(email, checkoutRequest);
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Order placed successfully")
                .data(order)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getMyOrderHistory(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "orderDate") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction,
            Authentication authentication) {

        String email = authentication.getName();
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<OrderDto> orders = orderService.getUserOrderHistory(email, pageable);
        ApiResponse<Page<OrderDto>> response = ApiResponse.<Page<OrderDto>>builder()
                .success(true)
                .message("Order history retrieved")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @PathVariable("id") String id, Authentication authentication) {
        String email = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority()));

        OrderDto order = orderService.getOrderById(id, email, isAdmin);
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Order details retrieved")
                .data(order)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrdersForAdmin(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "orderDate") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<OrderDto> orders = orderService.getAllOrdersForAdmin(status, search, pageable);
        ApiResponse<Page<OrderDto>> response = ApiResponse.<Page<OrderDto>>builder()
                .success(true)
                .message("Orders list retrieved for admin")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable("id") String id, @RequestParam("status") String status) {
        OrderDto updated = orderService.updateOrderStatus(id, status);
        ApiResponse<OrderDto> response = ApiResponse.<OrderDto>builder()
                .success(true)
                .message("Order status updated successfully")
                .data(updated)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
