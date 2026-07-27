package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    List<CategoryDto> getAllCategories();
    CategoryDto getCategoryById(String categoryId);
    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(String categoryId, CategoryDto categoryDto);
    void deleteCategory(String categoryId);
}
