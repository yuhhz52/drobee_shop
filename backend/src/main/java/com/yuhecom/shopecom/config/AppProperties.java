package com.yuhecom.shopecom.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String orderConfirmedUrl;

    public String getOrderConfirmedUrl() {
        return orderConfirmedUrl;
    }

    public void setOrderConfirmedUrl(String orderConfirmedUrl) {
        this.orderConfirmedUrl = orderConfirmedUrl;
    }
}

