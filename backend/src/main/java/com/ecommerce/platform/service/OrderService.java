package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.CheckoutRequest;
import com.ecommerce.platform.dto.OrderDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDto placeOrder(String email, CheckoutRequest checkoutRequest);
    Page<OrderDto> getUserOrderHistory(String email, Pageable pageable);
    OrderDto getOrderById(String orderId, String email, boolean isAdmin);
    Page<OrderDto> getAllOrdersForAdmin(String status, String search, Pageable pageable);
    OrderDto updateOrderStatus(String orderId, String statusName);
}
