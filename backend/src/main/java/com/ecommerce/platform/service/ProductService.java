package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductDto> getProducts(String categoryId, String search, Pageable pageable);
    ProductDto getProductById(String productId);
    ProductDto createProduct(ProductDto productDto);
    ProductDto updateProduct(String productId, ProductDto productDto);
    void deleteProduct(String productId);
    ProductDto updateStockAndPrice(String productId, Integer stock, java.math.BigDecimal price);
}
