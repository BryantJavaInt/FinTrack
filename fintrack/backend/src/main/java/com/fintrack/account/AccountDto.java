package com.fintrack.account;

import java.time.Instant;

public record AccountDto(Long id, String name, String currency, Instant createdAt) {
    public static AccountDto from(Account a) {
        return new AccountDto(a.getId(), a.getName(), a.getCurrency(), a.getCreatedAt());
    }
}
