package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.LoginRequest;
import com.ecommerce.platform.dto.LoginResponse;
import com.ecommerce.platform.dto.RegisterRequest;
import com.ecommerce.platform.dto.UserDto;

public interface AuthService {
    UserDto registerUser(RegisterRequest registerRequest);
    LoginResponse loginUser(LoginRequest loginRequest);
}
