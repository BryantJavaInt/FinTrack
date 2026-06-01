package com.fintrack.transaction;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionDto(
        Long id,
        Long accountId,
        String accountName,
        String currency,
        BigDecimal amount,
        TransactionType type,
        String category,
        String description,
        Instant occurredAt
) {
    public static TransactionDto from(Transaction t) {
        return new TransactionDto(
                t.getId(),
                t.getAccount().getId(),
                t.getAccount().getName(),
                t.getAccount().getCurrency(),
                t.getAmount(),
                t.getType(),
                t.getCategory(),
                t.getDescription(),
                t.getOccurredAt()
        );
    }
}
