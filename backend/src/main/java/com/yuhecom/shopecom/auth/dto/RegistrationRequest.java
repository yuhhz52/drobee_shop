package com.yuhecom.shopecom.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    private String firstName;
    private String lastName;
    private String email;
    private CharSequence password;
    private String phoneNumber;
}
