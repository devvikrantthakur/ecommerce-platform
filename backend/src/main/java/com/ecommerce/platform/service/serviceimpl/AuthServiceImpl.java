package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.LoginRequest;
import com.ecommerce.platform.dto.LoginResponse;
import com.ecommerce.platform.dto.RegisterRequest;
import com.ecommerce.platform.dto.UserDto;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.entity.UserRole;
import com.ecommerce.platform.entity.UserStatus;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.repository.UserRoleRepository;
import com.ecommerce.platform.repository.UserStatusRepository;
import com.ecommerce.platform.security.JwtUtils;
import com.ecommerce.platform.security.UserDetailsImpl;
import com.ecommerce.platform.service.AuthService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository roleRepository;

    @Autowired
    private UserStatusRepository statusRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public UserDto registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        UserRole customerRole = roleRepository.findByRoleName("ROLE_CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Default Customer Role not found"));

        UserStatus activeStatus = statusRepository.findByStatusName("ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Default Active Status not found"));

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .mobileNumber(registerRequest.getMobileNumber())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(customerRole)
                .status(activeStatus)
                .build();

        User savedUser = userRepository.save(user);

        UserDto userDto = modelMapper.map(savedUser, UserDto.class);
        userDto.setRoleName(savedUser.getRole().getRoleName());
        userDto.setStatusName(savedUser.getStatus().getStatusName());
        return userDto;
    }

    @Override
    public LoginResponse loginUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid Email or Password"));

        if ("BLOCKED".equals(user.getStatus().getStatusName())) {
            throw new BadRequestException("Your account is blocked. Please contact admin.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        String role = userPrincipal.getAuthorities().iterator().next().getAuthority();

        return LoginResponse.builder()
                .token(jwt)
                .userId(userPrincipal.getUserId())
                .email(userPrincipal.getEmail())
                .firstName(userPrincipal.getFirstName())
                .lastName(userPrincipal.getLastName())
                .role(role)
                .build();
    }
}
