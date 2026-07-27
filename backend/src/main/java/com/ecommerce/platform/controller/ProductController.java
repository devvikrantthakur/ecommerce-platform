package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.ApiResponse;
import com.ecommerce.platform.dto.ProductDto;
import com.ecommerce.platform.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Define local upload folder
    private static final String UPLOAD_DIR = "C:/Users/vikra/.gemini/antigravity/scratch/ecommerce-platform/backend/uploads/";

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(name = "categoryId", required = false) String categoryId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "productName") String sortBy,
            @RequestParam(name = "direction", defaultValue = "asc") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductDto> products = productService.getProducts(categoryId, search, pageable);
        ApiResponse<Page<ProductDto>> response = ApiResponse.<Page<ProductDto>>builder()
                .success(true)
                .message("Products retrieved successfully")
                .data(products)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable("id") String id) {
        ProductDto product = productService.getProductById(id);
        ApiResponse<ProductDto> response = ApiResponse.<ProductDto>builder()
                .success(true)
                .message("Product retrieved successfully")
                .data(product)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductDto productDto) {
        ProductDto created = productService.createProduct(productDto);
        ApiResponse<ProductDto> response = ApiResponse.<ProductDto>builder()
                .success(true)
                .message("Product created successfully")
                .data(created)
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable("id") String id, @Valid @RequestBody ProductDto productDto) {
        ProductDto updated = productService.updateProduct(id, productDto);
        ApiResponse<ProductDto> response = ApiResponse.<ProductDto>builder()
                .success(true)
                .message("Product updated successfully")
                .data(updated)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable("id") String id) {
        productService.deleteProduct(id);
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Product deleted successfully")
                .data("Deleted ID: " + id)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/stock-price")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> updateStockAndPrice(
            @PathVariable("id") String id,
            @RequestParam(name = "stock", required = false) Integer stock,
            @RequestParam(name = "price", required = false) BigDecimal price) {

        ProductDto updated = productService.updateStockAndPrice(id, stock, price);
        ApiResponse<ProductDto> response = ApiResponse.<ProductDto>builder()
                .success(true)
                .message("Stock/Price updated successfully")
                .data(updated)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> uploadProductImage(
            @PathVariable("id") String id,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return new ResponseEntity<>(ApiResponse.<ProductDto>builder()
                    .success(false)
                    .message("Please select a file to upload")
                    .timestamp(LocalDateTime.now()).build(), HttpStatus.BAD_REQUEST);
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName != null ? originalFileName.substring(originalFileName.lastIndexOf(".")) : ".jpg";
            String newFileName = UUID.randomUUID().toString() + extension;

            Path path = Paths.get(UPLOAD_DIR + newFileName);
            Files.write(path, file.getBytes());

            String imageUrl = "http://localhost:8080/api/v1/products/images/" + newFileName;
            ProductDto productDto = productService.getProductById(id);
            productDto.setImageUrl(imageUrl);
            
            ProductDto updated = productService.updateProduct(id, productDto);

            ApiResponse<ProductDto> response = ApiResponse.<ProductDto>builder()
                    .success(true)
                    .message("Product image uploaded successfully")
                    .data(updated)
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return new ResponseEntity<>(ApiResponse.<ProductDto>builder()
                    .success(false)
                    .message("Failed to upload image: " + e.getMessage())
                    .timestamp(LocalDateTime.now()).build(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable("fileName") String fileName) {
        try {
            Path path = Paths.get(UPLOAD_DIR + fileName);
            byte[] imageBytes = Files.readAllBytes(path);

            MediaType mediaType = MediaType.IMAGE_JPEG;
            if (fileName.toLowerCase().endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (fileName.toLowerCase().endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
