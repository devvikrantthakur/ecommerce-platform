package com.ecommerce.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private String orderId;
    private String cartId;
    private String userId;
    private String userEmail;
    private String orderStatusName;
    private String orderStatusDescription;
    private LocalDateTime orderDate;
    private List<OrderItemDto> items;

    // Payment details associated with this order
    private String paymentMode;
    private String paymentStatus;
    private BigDecimal paymentAmount;
    private String transactionId;
}
