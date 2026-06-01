package com.fintrack.account;

import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public List<AccountDto> getAccounts(User user) {
        return accountRepository.findByUserId(user.getId())
                .stream().map(AccountDto::from).toList();
    }

    @Transactional
    public AccountDto createAccount(User user, CreateAccountRequest request) {
        var account = Account.builder()
                .user(user)
                .name(request.name())
                .currency(request.currency())
                .build();
        return AccountDto.from(accountRepository.save(account));
    }

    public Account getOwnedAccount(Long accountId, User user) {
        return accountRepository.findByIdAndUserId(accountId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
    }
}
