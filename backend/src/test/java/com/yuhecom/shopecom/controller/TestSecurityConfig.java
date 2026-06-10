package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.config.AppProperties;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.util.List;

@TestConfiguration
public class TestSecurityConfig {

    @Bean
    @Primary
    public AppProperties appProperties() {
        AppProperties props = new AppProperties();
        props.setOrderConfirmedUrl("http://localhost:8080/orders/confirmed");
        props.getOauth2().setRedirectUri("http://localhost:8080/oauth2/callback");
        props.getCors().setAllowedOrigins(List.of("http://localhost:3000"));
        return props;
    }
}
