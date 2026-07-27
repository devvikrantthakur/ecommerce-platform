package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.ProductDto;
import com.ecommerce.platform.entity.Category;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.CategoryRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.service.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Page<ProductDto> getProducts(String categoryId, String search, Pageable pageable) {
        String querySearch = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String queryCategoryId = (categoryId == null || categoryId.trim().isEmpty()) ? null : categoryId.trim();

        Page<Product> products = productRepository.searchProducts(queryCategoryId, querySearch, pageable);
        return products.map(product -> {
            ProductDto dto = modelMapper.map(product, ProductDto.class);
            dto.setCategoryId(product.getCategory().getCategoryId());
            dto.setCategoryName(product.getCategory().getName());
            return dto;
        });
    }

    @Override
    public ProductDto getProductById(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        ProductDto dto = modelMapper.map(product, ProductDto.class);
        dto.setCategoryId(product.getCategory().getCategoryId());
        dto.setCategoryName(product.getCategory().getName());
        return dto;
    }

    @Override
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDto.getCategoryId()));

        Product product = modelMapper.map(productDto, Product.class);
        product.setCategory(category);
        product.setIsDelete(false);

        Product savedProduct = productRepository.save(product);
        ProductDto dto = modelMapper.map(savedProduct, ProductDto.class);
        dto.setCategoryId(savedProduct.getCategory().getCategoryId());
        dto.setCategoryName(savedProduct.getCategory().getName());
        return dto;
    }

    @Override
    @Transactional
    public ProductDto updateProduct(String productId, ProductDto productDto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDto.getCategoryId()));

        product.setCategory(category);
        product.setProductName(productDto.getProductName());
        product.setProductDescription(productDto.getProductDescription());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        if (productDto.getImageUrl() != null) {
            product.setImageUrl(productDto.getImageUrl());
        }

        Product updatedProduct = productRepository.save(product);
        ProductDto dto = modelMapper.map(updatedProduct, ProductDto.class);
        dto.setCategoryId(updatedProduct.getCategory().getCategoryId());
        dto.setCategoryName(updatedProduct.getCategory().getName());
        return dto;
    }

    @Override
    @Transactional
    public void deleteProduct(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        product.setIsDelete(true);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public ProductDto updateStockAndPrice(String productId, Integer stock, BigDecimal price) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (stock != null) {
            product.setStock(stock);
        }
        if (price != null) {
            product.setPrice(price);
        }

        Product updatedProduct = productRepository.save(product);
        ProductDto dto = modelMapper.map(updatedProduct, ProductDto.class);
        dto.setCategoryId(updatedProduct.getCategory().getCategoryId());
        dto.setCategoryName(updatedProduct.getCategory().getName());
        return dto;
    }
}
