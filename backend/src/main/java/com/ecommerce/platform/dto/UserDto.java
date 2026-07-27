package com.ecommerce.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String userId;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String roleName;
    private String statusName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
