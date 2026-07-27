package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.CheckoutRequest;
import com.ecommerce.platform.dto.OrderDto;
import com.ecommerce.platform.dto.OrderItemDto;
import com.ecommerce.platform.entity.*;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.exception.UnauthorizedException;
import com.ecommerce.platform.repository.*;
import com.ecommerce.platform.service.OrderService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAddressRepository addressRepository;

    @Autowired
    private OrderStatusRepository orderStatusRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private OrderDto mapToOrderDto(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        List<OrderItemDto> itemDtos = items.stream().map(item -> {
            BigDecimal subTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return OrderItemDto.builder()
                    .orderItemId(item.getOrderItemId())
                    .productId(item.getProduct().getProductId())
                    .productName(item.getProduct().getProductName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .subTotal(subTotal)
                    .build();
        }).collect(Collectors.toList());

        Payment payment = paymentRepository.findByOrderOrderId(order.getOrderId()).orElse(null);

        OrderDto dto = OrderDto.builder()
                .orderId(order.getOrderId())
                .cartId(order.getCart().getCartId())
                .userId(order.getUser().getUserId())
                .userEmail(order.getUser().getEmail())
                .orderStatusName(order.getOrderStatus().getName())
                .orderStatusDescription(order.getOrderStatus().getDescription())
                .orderDate(order.getOrderDate())
                .items(itemDtos)
                .build();

        if (payment != null) {
            dto.setPaymentMode(payment.getPaymentMode());
            dto.setPaymentStatus(payment.getPaymentStatus());
            dto.setPaymentAmount(payment.getPaymentAmount());
            dto.setTransactionId(payment.getTransactionId());
        }

        return dto;
    }

    @Override
    @Transactional
    public OrderDto placeOrder(String email, CheckoutRequest checkoutRequest) {
        User user = getUserByEmail(email);

        // 1. Get active cart
        Cart cart = cartRepository.findByUserUserIdAndStatus(user.getUserId(), "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("No active cart session found"));

        List<CartItem> cartItems = cartItemRepository.findByCartCartId(cart.getCartId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your shopping cart is empty");
        }

        // 2. Validate Address
        UserAddress address = addressRepository.findById(checkoutRequest.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Selected address does not exist"));

        if (!address.getUser().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedException("Delivery address does not belong to you");
        }

        // 3. Validate and Deduct Stock
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient inventory for product: " + product.getProductName() + 
                        ". Only " + product.getStock() + " units available.");
            }
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        // 4. Create Order
        OrderStatus pendingStatus = orderStatusRepository.findByName("PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("OrderStatus 'PENDING' not found"));

        Order order = Order.builder()
                .cart(cart)
                .user(user)
                .orderStatus(pendingStatus)
                .orderDate(LocalDateTime.now())
                .isDelete(false)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 5. Create Order Items
        for (CartItem item : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .isDelete(false)
                    .build();
            orderItemRepository.save(orderItem);
        }

        // 6. Process Payment
        String txId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String payStatus = "COD".equalsIgnoreCase(checkoutRequest.getPaymentMode()) ? "PENDING" : "SUCCESS";
        
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMode(checkoutRequest.getPaymentMode().toUpperCase())
                .paymentAmount(cart.getTotalAmount())
                .paymentStatus(payStatus)
                .transactionId(txId)
                .paymentDate(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        // 7. Mark Cart as CHECKED_OUT
        cart.setStatus("CHECKED_OUT");
        cartRepository.save(cart);

        return mapToOrderDto(savedOrder);
    }

    @Override
    public Page<OrderDto> getUserOrderHistory(String email, Pageable pageable) {
        User user = getUserByEmail(email);
        Page<Order> orders = orderRepository.findByUserUserId(user.getUserId(), pageable);
        return orders.map(this::mapToOrderDto);
    }

    @Override
    public OrderDto getOrderById(String orderId, String email, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!isAdmin && !order.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("You are not authorized to view this order details");
        }

        return mapToOrderDto(order);
    }

    @Override
    public Page<OrderDto> getAllOrdersForAdmin(String status, String search, Pageable pageable) {
        String queryStatus = (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) ? null : status.trim();
        String querySearch = (search == null || search.trim().isEmpty()) ? null : search.trim();

        Page<Order> orders = orderRepository.searchOrders(queryStatus, querySearch, pageable);
        return orders.map(this::mapToOrderDto);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(String orderId, String statusName) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus newStatus = orderStatusRepository.findByName(statusName.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("OrderStatus '" + statusName + "' not found"));

        String oldStatusName = order.getOrderStatus().getName();

        // Check if canceling and restock items
        if ("CANCELLED".equalsIgnoreCase(statusName) && !"CANCELLED".equalsIgnoreCase(oldStatusName)) {
            List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
            for (OrderItem item : items) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }

            // Mark associated payment failed if it was pending
            Payment payment = paymentRepository.findByOrderOrderId(order.getOrderId()).orElse(null);
            if (payment != null && "PENDING".equalsIgnoreCase(payment.getPaymentStatus())) {
                payment.setPaymentStatus("FAILED");
                paymentRepository.save(payment);
            }
        }
        
        // If transitioning from PENDING -> CONFIRMED, update payment to SUCCESS if appropriate
        if ("CONFIRMED".equalsIgnoreCase(statusName) && "PENDING".equalsIgnoreCase(oldStatusName)) {
            Payment payment = paymentRepository.findByOrderOrderId(order.getOrderId()).orElse(null);
            if (payment != null && "COD".equalsIgnoreCase(payment.getPaymentMode()) && "PENDING".equalsIgnoreCase(payment.getPaymentStatus())) {
                // Keep pending until delivered, or mark success on delivery. Let's mark success on DELIVERED!
            }
        }

        if ("DELIVERED".equalsIgnoreCase(statusName)) {
            Payment payment = paymentRepository.findByOrderOrderId(order.getOrderId()).orElse(null);
            if (payment != null && "PENDING".equalsIgnoreCase(payment.getPaymentStatus())) {
                payment.setPaymentStatus("SUCCESS");
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);
            }
        }

        order.setOrderStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderDto(updatedOrder);
    }
}
