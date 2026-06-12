package com.yuhecom.shopecom.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateQuantityRequest {

    @Min(value = 0, message = "quantity must be >= 0 (0 = remove)")
    @Max(value = 99, message = "maximum quantity per item is 99")
    private Integer quantity;
}
