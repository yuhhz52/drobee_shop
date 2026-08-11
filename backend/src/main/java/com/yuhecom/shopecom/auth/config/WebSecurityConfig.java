package com.yuhecom.shopecom.auth.config;

import com.yuhecom.shopecom.auth.handler.OAuth2LoginSuccessHandler;
import com.yuhecom.shopecom.config.AppProperties;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

import com.yuhecom.shopecom.auth.service.TokenBlacklistService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    @Autowired
    private JWTTokenHelper jwtTokenHelper;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Autowired
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private AppProperties appProperties;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private static final String[] PUBLIC_APIS = {
            "/api/auth/**",
            "/api/cart/**",
            "/oauth2/**",
            "/login/oauth2/code/**",
            "/uploads/**",
            "/api/orders/vnpay-return",
            "/actuator/health/**", "/actuator/health", "/actuator/info"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )

                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorization")
                        )
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*")
                        )
                )
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(PUBLIC_APIS).permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/collections/**", "/api/banners/**").permitAll()
                    // Swagger UI page is public so anyone with the URL
                    // can open it and test endpoints that require a Bearer
                    // JWT via the "Authorize" button. No secret api_key
                    // or static HTML is required.
                    .requestMatchers("/v1/swagger-ui", "/v1/swagger-ui/**").permitAll()
                    .requestMatchers("/v1/openapi", "/v1/openapi/**").permitAll()
                    // The OpenAPI JSON served by springdoc at /v1/api-docs
                    // is also public so Swagger UI can fetch it. Springdoc
                    // is still enabled below via springdoc.swagger-ui.enabled
                    // but we redirect the UI to load from /v1/openapi.
                    .requestMatchers("/v1/api-docs", "/v1/api-docs/**").permitAll()
                    .anyRequest().authenticated()
                )
                .addFilterBefore(new JWTAuthentication(jwtTokenHelper, userDetailsService, tokenBlacklistService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        List<String> origins = appProperties.getCors().getAllowedOrigins()
                .stream()
                .filter(o -> o != null && !o.isBlank())
                .toList();

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                "app.cors.allowed-origins is empty. " +
                "Set APP_CORS_ORIGINS env var (comma-separated, e.g. https://example.com,https://www.example.com) " +
                "or configure application.yaml with non-empty allowed-origins list."
            );
        }

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type", "Content-Range"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    @Configuration
    public class WebConfig implements WebMvcConfigurer {
        @Override
        public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:" + uploadDir + "/");
        }
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
