package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.UserDto;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.entity.UserStatus;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.repository.UserStatusRepository;
import com.ecommerce.platform.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatusRepository statusRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    private UserDto mapToUserDto(User user) {
        UserDto dto = modelMapper.map(user, UserDto.class);
        dto.setRoleName(user.getRole().getRoleName());
        dto.setStatusName(user.getStatus().getStatusName());
        return dto;
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToUserDto(user);
    }

    @Override
    @Transactional
    public UserDto blockUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        UserStatus blockedStatus = statusRepository.findByStatusName("BLOCKED")
                .orElseThrow(() -> new ResourceNotFoundException("Status 'BLOCKED' not found"));

        user.setStatus(blockedStatus);
        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Override
    @Transactional
    public UserDto activateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        UserStatus activeStatus = statusRepository.findByStatusName("ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Status 'ACTIVE' not found"));

        user.setStatus(activeStatus);
        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Override
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToUserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateCurrentUser(String email, UserDto userDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setMobileNumber(userDto.getMobileNumber());

        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
