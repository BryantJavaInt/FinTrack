package com.fintrack.transaction;

import com.fintrack.account.AccountService;
import com.fintrack.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    public Page<TransactionDto> getTransactions(Long accountId, User user, Pageable pageable) {
        accountService.getOwnedAccount(accountId, user);
        return transactionRepository.findByAccountIdOrderByOccurredAtDesc(accountId, pageable)
                .map(TransactionDto::from);
    }

    public List<TransactionDto> getRecent(User user, int limit) {
        return transactionRepository
                .findRecentByUserId(user.getId(), Pageable.ofSize(limit))
                .stream().map(TransactionDto::from).toList();
    }

    @Transactional
    public TransactionDto create(Long accountId, User user, CreateTransactionRequest request) {
        var account = accountService.getOwnedAccount(accountId, user);
        var tx = Transaction.builder()
                .account(account)
                .amount(request.amount())
                .type(request.type())
                .category(request.category())
                .description(request.description())
                .occurredAt(request.occurredAt())
                .build();
        return TransactionDto.from(transactionRepository.save(tx));
    }
}
