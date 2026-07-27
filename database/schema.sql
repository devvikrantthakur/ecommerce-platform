-- E-Commerce DB Schema
DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db;
USE ecommerce_db;

-- 1. Role Master
CREATE TABLE user_role_master (
    role_id VARCHAR(36) PRIMARY KEY,
    role_name VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE
);

-- 2. Status Master
CREATE TABLE user_status_master (
    status_id VARCHAR(36) PRIMARY KEY,
    status_name VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE
);

-- 3. User Master
CREATE TABLE user_master (
    user_id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    mobile_number VARCHAR(15),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    status_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_role_master(role_id),
    FOREIGN KEY (status_id) REFERENCES user_status_master(status_id)
);

-- 4. User Address Master
CREATE TABLE user_address_master (
    address_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    address_details TEXT NOT NULL,
    address_type VARCHAR(20) NOT NULL, -- HOME, OFFICE, OTHER
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user_master(user_id)
);

-- 5. Category Master
CREATE TABLE category_master (
    category_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE
);

-- 6. Product Master
CREATE TABLE product_master (
    product_id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    product_description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES category_master(category_id)
);

-- 7. Cart Master
CREATE TABLE cart_master (
    cart_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CHECKED_OUT, ABANDONED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user_master(user_id)
);

-- 8. Cart Item
CREATE TABLE cart_item (
    cart_item_id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cart_id) REFERENCES cart_master(cart_id),
    FOREIGN KEY (product_id) REFERENCES product_master(product_id)
);

-- 9. Order Status Master
CREATE TABLE order_status_master (
    order_status_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL, -- PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE
);

-- 10. Order Master
CREATE TABLE order_master (
    order_id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    order_status_id VARCHAR(36) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cart_id) REFERENCES cart_master(cart_id),
    FOREIGN KEY (user_id) REFERENCES user_master(user_id),
    FOREIGN KEY (order_status_id) REFERENCES order_status_master(order_status_id)
);

-- 11. Payment Master
CREATE TABLE payment_master (
    payment_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL, -- COD, UPI, CARD, CASH
    transaction_id VARCHAR(100),
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES order_master(order_id)
);

-- 12. Order Item
CREATE TABLE order_item (
    order_item_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (order_id) REFERENCES order_master(order_id),
    FOREIGN KEY (product_id) REFERENCES product_master(product_id)
);
