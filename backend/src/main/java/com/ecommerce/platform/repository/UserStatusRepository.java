package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserStatusRepository extends JpaRepository<UserStatus, String> {
    Optional<UserStatus> findByStatusName(String statusName);
}
