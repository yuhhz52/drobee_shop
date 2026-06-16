package com.yuhecom.shopecom.repository;

import com.yuhecom.shopecom.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BannerRepository extends JpaRepository<Banner, UUID> {

    @Query("SELECT b FROM Banner b WHERE b.active = true ORDER BY b.displayOrder ASC")
    List<Banner> findAllActiveOrderByDisplayOrder();
}
