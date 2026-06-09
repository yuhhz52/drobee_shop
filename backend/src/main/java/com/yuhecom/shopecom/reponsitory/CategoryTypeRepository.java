package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.entity.CategoryType;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryTypeRepository extends JpaRepository<CategoryType, UUID> {
    Optional<CategoryType> findByCategoryIdAndCode(UUID categoryId, String code);
    List<CategoryType> findByCategoryId(UUID categoryId);
}
