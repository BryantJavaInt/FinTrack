package com.fintrack.currency;

import java.math.BigDecimal;

public interface ExchangeRateService {
    /**
     * Returns the exchange rate from {@code from} currency to {@code to} currency.
     */
    BigDecimal getRate(String from, String to);
}
