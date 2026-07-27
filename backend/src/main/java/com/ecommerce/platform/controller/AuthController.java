package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.ApiResponse;
import com.ecommerce.platform.dto.LoginRequest;
import com.ecommerce.platform.dto.LoginResponse;
import com.ecommerce.platform.dto.RegisterRequest;
import com.ecommerce.platform.dto.UserDto;
import com.ecommerce.platform.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        UserDto registeredUser = authService.registerUser(registerRequest);
        ApiResponse<UserDto> response = ApiResponse.<UserDto>builder()
                .success(true)
                .message("User registered successfully")
                .data(registeredUser)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.loginUser(loginRequest);
        ApiResponse<LoginResponse> response = ApiResponse.<LoginResponse>builder()
                .success(true)
                .message("Login successful")
                .data(loginResponse)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {
        // Stateless JWT logout is handled on client-side by clearing tokens.
        // We return success to tell client authentication status is cleared.
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Logged out successfully")
                .data("Token cleared")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
