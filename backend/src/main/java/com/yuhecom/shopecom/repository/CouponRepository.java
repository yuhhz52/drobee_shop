package com.yuhecom.shopecom.repository;

import com.yuhecom.shopecom.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCode(String code);

    @Query("SELECT c FROM Coupon c WHERE c.code = :code AND c.active = true")
    Optional<Coupon> findActiveByCode(@Param("code") String code);

    @Modifying
    @Query("UPDATE Coupon c SET c.usedCount = c.usedCount + 1 WHERE c.id = :id")
    int incrementUsageCount(@Param("id") UUID id);

    boolean existsByCode(String code);
}
