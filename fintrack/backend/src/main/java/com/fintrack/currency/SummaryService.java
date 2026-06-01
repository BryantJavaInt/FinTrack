package com.fintrack.currency;

import com.fintrack.transaction.Transaction;
import com.fintrack.transaction.TransactionRepository;
import com.fintrack.transaction.TransactionType;
import com.fintrack.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;
    private final ExchangeRateService exchangeRateService;

    public SummaryDto getSummary(User user, String baseCurrency) {
        var transactions = transactionRepository.findAllByUserId(user.getId());

        Map<String, BigDecimal> balances = new HashMap<>();
        for (Transaction tx : transactions) {
            String currency = tx.getAccount().getCurrency();
            BigDecimal signed = tx.getType() == TransactionType.INCOME
                    ? tx.getAmount()
                    : tx.getAmount().negate();
            balances.merge(currency, signed, BigDecimal::add);
        }

        BigDecimal total = balances.entrySet().stream()
                .map(e -> {
                    BigDecimal rate = exchangeRateService.getRate(e.getKey(), baseCurrency);
                    return e.getValue().multiply(rate);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return new SummaryDto(balances, total, baseCurrency);
    }
}
