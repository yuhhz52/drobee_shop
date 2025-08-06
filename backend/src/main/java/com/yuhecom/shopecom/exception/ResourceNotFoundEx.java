package com.yuhecom.shopecom.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundEx extends RuntimeException{
    public ResourceNotFoundEx(String str){
        super(str);
    }
    public ResourceNotFoundEx(String str, Throwable cause){
        super(str,cause);
    }
}
