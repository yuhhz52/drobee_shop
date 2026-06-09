package com.yuhecom.shopecom.reponsitory;

import com.yuhecom.shopecom.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    @Query(
        "SELECT c FROM Collection c WHERE c.slug = :slug AND c.active = true AND c.deletedAt IS NULL"
    )
    Optional<Collection> findBySlugAndActiveTrue(String slug);

    Optional<Collection> findBySlug(String slug);
}
