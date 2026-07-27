package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    Optional<Cart> findByUserUserIdAndStatus(String userId, String status);
}
