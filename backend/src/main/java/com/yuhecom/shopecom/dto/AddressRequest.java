package com.yuhecom.shopecom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {

    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 255)
    private String street;

    @NotBlank
    private String provinceCode;

    @NotBlank
    private String provinceName;

    @NotBlank
    private String wardCode;

    @NotBlank
    private String wardName;

    @NotBlank
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Invalid Vietnamese phone number")
    @Size(max = 30)
    private String phoneNumber;

}
