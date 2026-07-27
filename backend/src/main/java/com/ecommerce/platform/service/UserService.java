package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.UserDto;
import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(String userId);
    UserDto blockUser(String userId);
    UserDto activateUser(String userId);
    UserDto getCurrentUser(String email);
    UserDto updateCurrentUser(String email, UserDto userDto);
    void changePassword(String email, String currentPassword, String newPassword);
}
