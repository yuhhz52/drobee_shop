package com.yuhecom.shopecom.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    private String userName;
    private CharSequence password;
}
