package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.AddressDto;
import com.ecommerce.platform.dto.ApiResponse;
import com.ecommerce.platform.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getMyAddresses(Authentication authentication) {
        String email = authentication.getName();
        List<AddressDto> addresses = addressService.getAddressesByUserEmail(email);
        ApiResponse<List<AddressDto>> response = ApiResponse.<List<AddressDto>>builder()
                .success(true)
                .message("Addresses retrieved successfully")
                .data(addresses)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> getAddressById(
            @PathVariable("id") String id, Authentication authentication) {
        String email = authentication.getName();
        AddressDto address = addressService.getAddressById(id, email);
        ApiResponse<AddressDto> response = ApiResponse.<AddressDto>builder()
                .success(true)
                .message("Address details retrieved")
                .data(address)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @Valid @RequestBody AddressDto addressDto, Authentication authentication) {
        String email = authentication.getName();
        AddressDto created = addressService.addAddress(email, addressDto);
        ApiResponse<AddressDto> response = ApiResponse.<AddressDto>builder()
                .success(true)
                .message("Address added successfully")
                .data(created)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @PathVariable("id") String id, @Valid @RequestBody AddressDto addressDto, Authentication authentication) {
        String email = authentication.getName();
        AddressDto updated = addressService.updateAddress(id, email, addressDto);
        ApiResponse<AddressDto> response = ApiResponse.<AddressDto>builder()
                .success(true)
                .message("Address updated successfully")
                .data(updated)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @PathVariable("id") String id, Authentication authentication) {
        String email = authentication.getName();
        addressService.deleteAddress(id, email);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Address deleted successfully")
                .data("Deleted ID: " + id)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
