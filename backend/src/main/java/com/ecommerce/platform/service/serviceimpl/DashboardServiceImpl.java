package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.DashboardStatsDto;
import com.ecommerce.platform.repository.CategoryRepository;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.repository.PaymentRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.countByStatusStatusName("ACTIVE") + userRepository.countByStatusStatusName("BLOCKED");
        long totalProducts = productRepository.count();
        long totalCategories = categoryRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal revenue = paymentRepository.sumSuccessfulPayments();

        return DashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .totalOrders(totalOrders)
                .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                .build();
    }
}
