package com.yuhecom.shopecom.auth.controller;

import com.yuhecom.shopecom.auth.dto.UsersDto;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.auth.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/api/user")
public class UsersController {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private UsersRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UsersDto> getUserProfile(Principal principal){
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());

        if(null == user){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        UsersDto userDetailsDto = UsersDto.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .id(user.getId())
                .phoneNumber(user.getPhoneNumber())
                .addressList(user.getAddressList())
                .authorityList(
                    user.getAuthorities().stream()
                        .map(a -> a.getAuthority())
                        .toList()
        )
                .build();

        return new ResponseEntity<>(userDetailsDto, HttpStatus.OK);

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

        //React Admin cần Content-Range
        response.setHeader("Content-Range", "users " + start + "-" + end + "/" + userPage.getTotalElements());
        response.setHeader("Access-Control-Expose-Headers", "Content-Range");

        return ResponseEntity.ok(userPage.getContent());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build(); // 404
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
    }

}
