USE ecommerce_db;

-- Populate Roles
INSERT INTO user_role_master (role_id, role_name, is_delete) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'ROLE_ADMIN', FALSE),
('f4e3d2c1-b0a9-8765-4321-0fedcba98765', 'ROLE_CUSTOMER', FALSE);

-- Populate Statuses
INSERT INTO user_status_master (status_id, status_name, is_delete) VALUES
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ACTIVE', FALSE),
('9f8e7d6c-5b4a-3f2e-1d0c-fedcba987654', 'BLOCKED', FALSE);

-- Populate Order Statuses
INSERT INTO order_status_master (order_status_id, name, description, is_delete) VALUES
('o1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'PENDING', 'Order placed, awaiting confirmation', FALSE),
('o2b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'CONFIRMED', 'Order confirmed by seller', FALSE),
('o3b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'PACKED', 'Order packed and ready to ship', FALSE),
('o4b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'SHIPPED', 'Order is in transit', FALSE),
('o5b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'DELIVERED', 'Order delivered successfully', FALSE),
('o6b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'CANCELLED', 'Order cancelled', FALSE);

-- Populate Default Admin User (Password is 'admin123' BCrypted)
INSERT INTO user_master (user_id, first_name, last_name, mobile_number, email, password, role_id, status_id) VALUES
('u1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'App', 'Admin', '9999999999', 'admin@ecommerce.com', '$2a$10$Hky5qh95k9wxqEIpOVUGF.8derI2PVE.yBaXHimDM78ock.IVRBU2', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d');
