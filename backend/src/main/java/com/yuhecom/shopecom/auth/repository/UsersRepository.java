package com.yuhecom.shopecom.auth.repository;

import com.yuhecom.shopecom.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UsersRepository extends JpaRepository<User, UUID>{
    User findByEmail(String username);

}


