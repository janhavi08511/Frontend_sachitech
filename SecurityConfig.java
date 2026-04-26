package com.example.sachitech.config;

import com.example.sachitech.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ OPTIONS
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/lms/uploads/**").permitAll() // ✅ MUST BE BEFORE /lms/**
                        .requestMatchers("/auth/createuser").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/manager/**").hasRole("MANAGER")
                        .requestMatchers("/trainer/**").hasRole("TRAINER")
                        .requestMatchers("/studentdata/**").hasAnyRole("ADMIN","MANAGER","TRAINER")
                        .requestMatchers("/student/**").permitAll()
                        .requestMatchers("/course/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/batch/**").hasAnyRole("ADMIN", "MANAGER","TRAINER")
                        .requestMatchers("/lms/assignments/**").hasAnyRole("ADMIN","MANAGER","TRAINER","STUDENT")
                        .requestMatchers("/lms/**").hasAnyRole("ADMIN","MANAGER","TRAINER","STUDENT")
                        .requestMatchers("/module/**").hasAnyRole("ADMIN" , "MANAGER" , "TRAINER")
                        .requestMatchers("/assignment/**").hasAnyRole("ADMIN","MANAGER","TRAINER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
