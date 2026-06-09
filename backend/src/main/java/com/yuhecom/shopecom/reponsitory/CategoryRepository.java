package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.categoryTypes")
    List<Category> findAllWithCategoryTypes();

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.categoryTypes WHERE c.id = :id")
    Optional<Category> findByIdWithCategoryTypes(UUID id);

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.categoryTypes WHERE c.code = :code")
    Optional<Category> findByCodeWithCategoryTypes(String code);
}
