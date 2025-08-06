package com.yuhecom.shopecom.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {

    private int code;
    private String message;

}