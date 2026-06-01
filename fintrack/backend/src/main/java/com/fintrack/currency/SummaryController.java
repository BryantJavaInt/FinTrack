package com.fintrack.currency;

import com.fintrack.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping
    public SummaryDto getSummary(@AuthenticationPrincipal User user,
                                 @RequestParam(defaultValue = "CHF") String baseCurrency) {
        return summaryService.getSummary(user, baseCurrency);
    }
}
