package com.yuhecom.shopecom.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String orderConfirmedUrl;
    private final OAuth2 oauth2 = new OAuth2();
    private final Cors cors = new Cors();

    public String getOrderConfirmedUrl() {
        return orderConfirmedUrl;
    }

    public void setOrderConfirmedUrl(String orderConfirmedUrl) {
        this.orderConfirmedUrl = orderConfirmedUrl;
    }

    public OAuth2 getOauth2() {
        return oauth2;
    }

    public Cors getCors() {
        return cors;
    }

    public static class OAuth2 {
        private String redirectUri;

        public String getRedirectUri() {
            return redirectUri;
        }

        public void setRedirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
        }
    }

    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>();

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
}

