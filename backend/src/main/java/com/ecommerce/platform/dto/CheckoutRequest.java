package com.ecommerce.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Delivery address is required")
    private String addressId;

    @NotBlank(message = "Payment mode is required (COD, UPI, CARD, CASH)")
    @Pattern(regexp = "^(COD|UPI|CARD|CASH)$", message = "Payment mode must be COD, UPI, CARD, or CASH")
    private String paymentMode;
}
