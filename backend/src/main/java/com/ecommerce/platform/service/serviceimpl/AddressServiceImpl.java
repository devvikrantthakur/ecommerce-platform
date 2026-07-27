package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.AddressDto;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.entity.UserAddress;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.exception.UnauthorizedException;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.repository.UserAddressRepository;
import com.ecommerce.platform.service.AddressService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private UserAddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private UserAddress getVerifiedAddress(String addressId, String email) {
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        if (!address.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("You are not authorized to access this address");
        }
        return address;
    }

    @Override
    public List<AddressDto> getAddressesByUserEmail(String email) {
        User user = getUserByEmail(email);
        return addressRepository.findByUserUserId(user.getUserId()).stream()
                .map(address -> {
                    AddressDto dto = modelMapper.map(address, AddressDto.class);
                    dto.setUserId(user.getUserId());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public AddressDto getAddressById(String addressId, String email) {
        UserAddress address = getVerifiedAddress(addressId, email);
        AddressDto dto = modelMapper.map(address, AddressDto.class);
        dto.setUserId(address.getUser().getUserId());
        return dto;
    }

    @Override
    @Transactional
    public AddressDto addAddress(String email, AddressDto addressDto) {
        User user = getUserByEmail(email);
        UserAddress address = modelMapper.map(addressDto, UserAddress.class);
        address.setUser(user);
        address.setIsDelete(false);

        UserAddress savedAddress = addressRepository.save(address);
        AddressDto dto = modelMapper.map(savedAddress, AddressDto.class);
        dto.setUserId(user.getUserId());
        return dto;
    }

    @Override
    @Transactional
    public AddressDto updateAddress(String addressId, String email, AddressDto addressDto) {
        UserAddress address = getVerifiedAddress(addressId, email);

        address.setAddressDetails(addressDto.getAddressDetails());
        address.setAddressType(addressDto.getAddressType());
        address.setCity(addressDto.getCity());
        address.setState(addressDto.getState());
        address.setPincode(addressDto.getPincode());

        UserAddress updatedAddress = addressRepository.save(address);
        AddressDto dto = modelMapper.map(updatedAddress, AddressDto.class);
        dto.setUserId(address.getUser().getUserId());
        return dto;
    }

    @Override
    @Transactional
    public void deleteAddress(String addressId, String email) {
        UserAddress address = getVerifiedAddress(addressId, email);
        address.setIsDelete(true);
        addressRepository.save(address);
    }
}
