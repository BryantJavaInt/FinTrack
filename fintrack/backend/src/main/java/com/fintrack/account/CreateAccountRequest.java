package com.fintrack.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateAccountRequest(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "CHF|EUR|USD|GBP", message = "must be CHF, EUR, USD, or GBP")
        String currency
) {}
