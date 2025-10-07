package com.yuhecom.shopecom.auth.controller;

import com.yuhecom.shopecom.auth.dto.UsersDto;
import com.yuhecom.shopecom.auth.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UsersController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UsersDto> getUserProfile(Principal principal) {
        return ResponseEntity.ok(userService.getUserProfile(principal));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletResponse response) {

        Page<UsersDto> userPage = userService.getAllUsers(page, size);

        int start = page * size;
        int end = Math.min(start + size - 1, (int) userPage.getTotalElements() - 1);

        // React Admin cần Content-Range
        response.setHeader("Content-Range", "users " + start + "-" + end + "/" + userPage.getTotalElements());
        response.setHeader("Access-Control-Expose-Headers", "Content-Range");

        return ResponseEntity.ok(userPage.getContent());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
