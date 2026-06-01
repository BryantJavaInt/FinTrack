package com.fintrack.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.auth.AuthResponse;
import com.fintrack.auth.LoginRequest;
import com.fintrack.auth.RegisterRequest;
import com.fintrack.transaction.CreateTransactionRequest;
import com.fintrack.transaction.TransactionType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class AuthAndTransactionIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void registerLoginAndCreateTransaction() throws Exception {
        // 1. Register
        var registerBody = objectMapper.writeValueAsString(
                new RegisterRequest("it@fintrack.ch", "password123", "IT User"));

        var registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        var authResponse = objectMapper.readValue(
                registerResult.getResponse().getContentAsString(), AuthResponse.class);
        String token = authResponse.token();

        // 2. Login
        var loginBody = objectMapper.writeValueAsString(
                new LoginRequest("it@fintrack.ch", "password123"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // 3. Create account
        var accountBody = """
                {"name":"Test Account","currency":"CHF"}""";

        var accountResult = mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .post("/api/accounts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .header("Authorization", "Bearer " + token)
                                .content(accountBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();

        long accountId = objectMapper.readTree(
                accountResult.getResponse().getContentAsString()).get("id").asLong();

        // 4. Create transaction
        var txBody = objectMapper.writeValueAsString(
                new CreateTransactionRequest(
                        new BigDecimal("250.00"),
                        TransactionType.INCOME,
                        "Salary",
                        "Test income",
                        null));

        mockMvc.perform(post("/api/accounts/{id}/transactions", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content(txBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(250.0))
                .andExpect(jsonPath("$.type").value("INCOME"))
                .andExpect(jsonPath("$.category").value("Salary"));
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        var registerBody = objectMapper.writeValueAsString(
                new RegisterRequest("wrong@fintrack.ch", "correctpass", "Wrong User"));
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        var loginBody = objectMapper.writeValueAsString(
                new LoginRequest("wrong@fintrack.ch", "badpassword"));
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
