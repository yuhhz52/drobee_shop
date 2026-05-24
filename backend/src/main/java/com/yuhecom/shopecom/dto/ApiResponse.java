package com.yuhecom.shopecom.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse <T>{
    @Builder.Default
    private int code = 1000;
    @Builder.Default
    private String message = "success";
    private String errorCode;
    private T result;

}
