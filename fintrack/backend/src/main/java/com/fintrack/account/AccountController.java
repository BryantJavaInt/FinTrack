package com.fintrack.account;

import com.fintrack.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public List<AccountDto> list(@AuthenticationPrincipal User user) {
        return accountService.getAccounts(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountDto create(@AuthenticationPrincipal User user,
                             @Valid @RequestBody CreateAccountRequest request) {
        return accountService.createAccount(user, request);
    }
}
