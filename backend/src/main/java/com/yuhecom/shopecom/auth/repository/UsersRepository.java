package com.yuhecom.shopecom.auth.repository;

import com.yuhecom.shopecom.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

@Repository
public interface UsersRepository extends JpaRepository<User, UUID>{
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.authorities WHERE u.email = :email")
    User findByEmail(@Param("email") String email);

}


