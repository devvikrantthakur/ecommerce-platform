package com.ecommerce.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private String addressId;
    private String userId;

    @NotBlank(message = "Address details are required")
    private String addressDetails;

    @NotBlank(message = "Address type is required (HOME, OFFICE, OTHER)")
    @Pattern(regexp = "^(HOME|OFFICE|OTHER)$", message = "Address type must be HOME, OFFICE, or OTHER")
    private String addressType;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[0-9]{5,10}$", message = "Pincode must be numeric and between 5 to 10 digits")
    private String pincode;
}
