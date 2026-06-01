package com.fintrack.currency;

import java.math.BigDecimal;
import java.util.Map;

public record SummaryDto(
        Map<String, BigDecimal> balancesByCurrency,
        BigDecimal totalInBaseCurrency,
        String baseCurrency
) {}
