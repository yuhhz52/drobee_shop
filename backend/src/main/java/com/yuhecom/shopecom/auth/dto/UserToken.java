package com.yuhecom.shopecom.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserToken {

    private String token;
    private String refreshToken;
}
