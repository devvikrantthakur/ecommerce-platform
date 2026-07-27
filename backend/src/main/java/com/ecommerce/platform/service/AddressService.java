package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.AddressDto;
import java.util.List;

public interface AddressService {
    List<AddressDto> getAddressesByUserEmail(String email);
    AddressDto getAddressById(String addressId, String email);
    AddressDto addAddress(String email, AddressDto addressDto);
    AddressDto updateAddress(String addressId, String email, AddressDto addressDto);
    void deleteAddress(String addressId, String email);
}
