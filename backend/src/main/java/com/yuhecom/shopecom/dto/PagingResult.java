package com.yuhecom.shopecom.dto;

import java.util.List;

public record PagingResult<T>(List<T> items, String contentRange) {
}

