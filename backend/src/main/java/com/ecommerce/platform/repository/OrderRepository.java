package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Page<Order> findByUserUserId(String userId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
           "(:statusName IS NULL OR o.orderStatus.name = :statusName) AND " +
           "(:search IS NULL OR LOWER(o.user.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.orderId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> searchOrders(@Param("statusName") String statusName,
                             @Param("search") String search,
                             Pageable pageable);
}
