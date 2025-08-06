package com.yuhecom.shopecom.auth.helper;

import java.security.SecureRandom;

public class VerificationCodeGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int CODE_LENGTH = 6;

    public static String generateCode() {
        int min = (int) Math.pow(10, CODE_LENGTH - 1); // VD: 10^5 = 100000
        int max = (int) Math.pow(10, CODE_LENGTH) - 1; // VD: 10^6 - 1 = 999999
        int code = secureRandom.nextInt((max - min) + 1) + min;
        return String.valueOf(code);
    }
}