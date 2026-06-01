package com.fintrack.transaction;

import com.fintrack.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts/{accountId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public Page<TransactionDto> list(@PathVariable Long accountId,
                                     @AuthenticationPrincipal User user,
                                     @PageableDefault(size = 20) Pageable pageable) {
        return transactionService.getTransactions(accountId, user, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDto create(@PathVariable Long accountId,
                                 @AuthenticationPrincipal User user,
                                 @Valid @RequestBody CreateTransactionRequest request) {
        return transactionService.create(accountId, user, request);
    }
}
