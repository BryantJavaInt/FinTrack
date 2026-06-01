package com.fintrack.currency;

import com.fintrack.account.Account;
import com.fintrack.transaction.Transaction;
import com.fintrack.transaction.TransactionRepository;
import com.fintrack.transaction.TransactionType;
import com.fintrack.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock TransactionRepository transactionRepository;
    @Mock ExchangeRateService exchangeRateService;
    @InjectMocks SummaryService summaryService;

    @Test
    void totalConvertsAllCurrenciesToBase() {
        var user = User.builder().id(1L).email("a@b.com").password("x").fullName("Test").build();

        var chfAccount = Account.builder().id(1L).user(user).name("Checking").currency("CHF").build();
        var eurAccount = Account.builder().id(2L).user(user).name("Savings").currency("EUR").build();

        var income = Transaction.builder()
                .id(1L).account(chfAccount)
                .amount(new BigDecimal("1000")).type(TransactionType.INCOME)
                .category("Salary").build();
        var expense = Transaction.builder()
                .id(2L).account(chfAccount)
                .amount(new BigDecimal("200")).type(TransactionType.EXPENSE)
                .category("Food").build();
        var eurIncome = Transaction.builder()
                .id(3L).account(eurAccount)
                .amount(new BigDecimal("500")).type(TransactionType.INCOME)
                .category("Freelance").build();

        when(transactionRepository.findAllByUserId(anyLong()))
                .thenReturn(List.of(income, expense, eurIncome));

        // CHF -> CHF = 1.0, EUR -> CHF = 1.05
        when(exchangeRateService.getRate("CHF", "CHF")).thenReturn(BigDecimal.ONE);
        when(exchangeRateService.getRate("EUR", "CHF")).thenReturn(new BigDecimal("1.05"));

        var summary = summaryService.getSummary(user, "CHF");

        // CHF balance: 1000 - 200 = 800
        assertThat(summary.balancesByCurrency().get("CHF"))
                .isEqualByComparingTo(new BigDecimal("800"));
        // EUR balance: 500
        assertThat(summary.balancesByCurrency().get("EUR"))
                .isEqualByComparingTo(new BigDecimal("500"));
        // total: 800 * 1.0 + 500 * 1.05 = 800 + 525 = 1325.00
        assertThat(summary.totalInBaseCurrency())
                .isEqualByComparingTo(new BigDecimal("1325.00"));
        assertThat(summary.baseCurrency()).isEqualTo("CHF");
    }

    @Test
    void emptyTransactionsReturnsZeroTotal() {
        var user = User.builder().id(2L).email("b@b.com").password("x").fullName("Empty").build();
        when(transactionRepository.findAllByUserId(anyLong())).thenReturn(List.of());

        var summary = summaryService.getSummary(user, "EUR");

        assertThat(summary.balancesByCurrency()).isEmpty();
        assertThat(summary.totalInBaseCurrency()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
