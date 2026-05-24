package com.yuhecom.shopecom.exception;

public class BusinessException extends AppException {
    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(ErrorCode errorCode, String messageOverride) {
        super(errorCode, messageOverride);
    }
}

