package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.CartDto;
import com.ecommerce.platform.dto.CartItemDto;
import com.ecommerce.platform.entity.Cart;
import com.ecommerce.platform.entity.CartItem;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.CartItemRepository;
import com.ecommerce.platform.repository.CartRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.service.CartService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Cart getOrCreateActiveCart(User user) {
        return cartRepository.findByUserUserIdAndStatus(user.getUserId(), "ACTIVE")
                .orElseGet(() -> {
                    Cart cart = Cart.builder()
                            .user(user)
                            .totalAmount(BigDecimal.ZERO)
                            .status("ACTIVE")
                            .isDelete(false)
                            .build();
                    return cartRepository.save(cart);
                });
    }

    private void updateCartTotals(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartCartId(cart.getCartId());
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            BigDecimal sub = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(sub);
        }
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }

    private CartDto mapToCartDto(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartCartId(cart.getCartId());
        List<CartItemDto> itemDtos = items.stream().map(item -> {
            BigDecimal subTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartItemDto.builder()
                    .cartItemId(item.getCartItemId())
                    .productId(item.getProduct().getProductId())
                    .productName(item.getProduct().getProductName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .subTotal(subTotal)
                    .build();
        }).collect(Collectors.toList());

        return CartDto.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUser().getUserId())
                .totalAmount(cart.getTotalAmount())
                .status(cart.getStatus())
                .items(itemDtos)
                .build();
    }

    @Override
    public CartDto getActiveCartByUserEmail(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateActiveCart(user);
        return mapToCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto addItemToCart(String email, String productId, Integer quantity) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateActiveCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (product.getStock() < quantity) {
            throw new BadRequestException("Insufficient stock available. Only " + product.getStock() + " left.");
        }

        CartItem item = cartItemRepository.findByCartCartIdAndProductProductId(cart.getCartId(), productId)
                .orElse(null);

        if (item != null) {
            int newQty = item.getQuantity() + quantity;
            if (product.getStock() < newQty) {
                throw new BadRequestException("Insufficient stock. Cannot add " + quantity + " more. Cart already has " + item.getQuantity() + ".");
            }
            item.setQuantity(newQty);
            item.setPrice(product.getPrice()); // Update with latest price
            cartItemRepository.save(item);
        } else {
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .price(product.getPrice())
                    .isDelete(false)
                    .build();
            cartItemRepository.save(item);
        }

        updateCartTotals(cart);
        return mapToCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto updateCartItemQuantity(String email, String cartItemId, Integer quantity) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateActiveCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        Product product = item.getProduct();
        if (product.getStock() < quantity) {
            throw new BadRequestException("Insufficient stock. Only " + product.getStock() + " units available.");
        }

        item.setQuantity(quantity);
        item.setPrice(product.getPrice()); // Keep up-to-date pricing
        cartItemRepository.save(item);

        updateCartTotals(cart);
        return mapToCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeCartItem(String email, String cartItemId) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateActiveCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new BadRequestException("Cart item does not belong to your cart");
        }

        item.setIsDelete(true);
        cartItemRepository.save(item);

        updateCartTotals(cart);
        return mapToCartDto(cart);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateActiveCart(user);

        List<CartItem> items = cartItemRepository.findByCartCartId(cart.getCartId());
        for (CartItem item : items) {
            item.setIsDelete(true);
            cartItemRepository.save(item);
        }

        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }
}
