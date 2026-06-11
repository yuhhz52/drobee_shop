package com.yuhecom.shopecom.auth.repository;

import com.yuhecom.shopecom.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsersRepository extends JpaRepository<User, UUID> {

    /**
     * Chỉ JOIN FETCH authorities — dùng cho authentication (login/JWT filter).
     * authorities là List → chỉ fetch 1 bag → không vi phạm MultipleBagFetchException.
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.authorities WHERE u.email = :email")
    Optional<User> findByEmailForAuth(@Param("email") String email);

    /**
     * JOIN FETCH cả authorities + addressList — dùng khi cần trả full profile về FE.
     * authorities = List, addressList = Set → fetch 2 bags khác loại → Hibernate cho phép.
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.authorities LEFT JOIN FETCH u.addressList WHERE u.email = :email")
    Optional<User> findByEmailForProfile(@Param("email") String email);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
