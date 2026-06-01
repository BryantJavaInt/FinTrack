package com.fintrack.transaction;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateTransactionRequest(
        @NotNull @Positive BigDecimal amount,
        @NotNull TransactionType type,
        @NotBlank @Size(max = 100) String category,
        @Size(max = 500) String description,
        Instant occurredAt
) {}
