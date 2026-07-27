package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByCartCartId(String cartId);
    Optional<CartItem> findByCartCartIdAndProductProductId(String cartId, String productId);
}
