package com.yuhecom.shopecom.auth.dto;

import lombok.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotNull
    @Size(min = 8, max = 100)
    private CharSequence password;

    @Size(max = 30)
    private String phoneNumber;

    private String confirmPassword;
}
