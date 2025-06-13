package ru.nabiullina.apigateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.WebFilter;

import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .cors().configurationSource(corsConfigurationSource()).and()
                .csrf().disable()
                .authorizeExchange(exchanges -> {
                    logger.info("Configuring authorization rules");
                    exchanges
                            .pathMatchers(
                                    "/eureka/**",
                                    "/backend-user-service/api/users/register"
                            ).permitAll()
                            .anyExchange().authenticated();
                })
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(Customizer.withDefaults())
                );
        return http.build();
    }


    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        logger.info("CORS configured with allowed origins: {}", corsConfig.getAllowedOrigins());
        return source;
    }

    @Bean
    public WebFilter logFilter() {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            logger.info("=== Incoming Request ===");
            logger.info("Path: {}", request.getPath());
            logger.info("Method: {}", request.getMethod());
            logger.info("URI: {}", request.getURI());
            logger.info("Headers: {}", request.getHeaders());
            logger.info("Query Params: {}", request.getQueryParams());

            return chain.filter(exchange)
                    .doFinally(signalType -> {
                        logger.info("=== Response Details ===");
                        logger.info("Status: {}", exchange.getResponse().getStatusCode());
                        logger.info("Response Headers: {}", exchange.getResponse().getHeaders());
                    });
        };
    }
}