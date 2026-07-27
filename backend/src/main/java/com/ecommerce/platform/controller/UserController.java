package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.ApiResponse;
import com.ecommerce.platform.dto.ChangePasswordRequest;
import com.ecommerce.platform.dto.UserDto;
import com.ecommerce.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        UserDto userDto = userService.getCurrentUser(email);
        ApiResponse<UserDto> response = ApiResponse.<UserDto>builder()
                .success(true)
                .message("Profile details retrieved")
                .data(userDto)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUserProfile(
            Authentication authentication, @Valid @RequestBody UserDto userDto) {
        String email = authentication.getName();
        UserDto updated = userService.updateCurrentUser(email, userDto);
        ApiResponse<UserDto> response = ApiResponse.<UserDto>builder()
                .success(true)
                .message("Profile details updated successfully")
                .data(updated)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication, @Valid @RequestBody ChangePasswordRequest req) {
        String email = authentication.getName();
        userService.changePassword(email, req.getCurrentPassword(), req.getNewPassword());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Password updated successfully")
                .data("Password changed")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        ApiResponse<List<UserDto>> response = ApiResponse.<List<UserDto>>builder()
                .success(true)
                .message("Users list retrieved")
                .data(users)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/block")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> blockUser(@PathVariable("id") String id) {
        UserDto blocked = userService.blockUser(id);
        ApiResponse<UserDto> response = ApiResponse.<UserDto>builder()
                .success(true)
                .message("User account blocked successfully")
                .data(blocked)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> activateUser(@PathVariable("id") String id) {
        UserDto activated = userService.activateUser(id);
        ApiResponse<UserDto> response = ApiResponse.<UserDto>builder()
                .success(true)
                .message("User account activated successfully")
                .data(activated)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
