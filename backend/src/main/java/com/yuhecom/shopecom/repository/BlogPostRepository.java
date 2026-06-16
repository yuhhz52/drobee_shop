package com.yuhecom.shopecom.repository;

import com.yuhecom.shopecom.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {

    @Query("SELECT b FROM BlogPost b WHERE b.active = true ORDER BY b.displayOrder ASC")
    List<BlogPost> findAllActiveOrderByDisplayOrder();
}
