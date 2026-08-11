package com.yuhecom.shopecom.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String BEARER_SCHEME_NAME = "bearer-jwt";

    /**
     * Builds the OpenAPI document that Swagger UI consumes. The
     * declared {@code bearer-jwt} security scheme is what makes the
     * "Authorize" button (the lock icon at the top of Swagger UI)
     * render — it gives the UI a place for users to paste the JWT
     * issued by {@code POST /api/auth/login}.
     *
     * <p>The {@code SecurityRequirement} added at the document level
     * means every operation inherits the bearer-jwt scheme, so the
     * padlock icon also shows up next to each endpoint.</p>
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ShopEcom API's")
                        .description("Shop E-commerce Application APIs")
                        .version("1.0")
                        .contact(new Contact().name("Thanh Huy")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME_NAME))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME_NAME,
                        new SecurityScheme()
                                .name(BEARER_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Provide a JWT access token issued by /api/auth/login. " +
                                        "Swagger UI and the OpenAPI document are restricted to ADMIN users.")));
    }
}