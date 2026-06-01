package com.fintrack.currency;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class FrankfurterExchangeRateService implements ExchangeRateService {

    private final WebClient webClient;

    public FrankfurterExchangeRateService(
            @Value("${fintrack.exchange-rate.base-url}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public BigDecimal getRate(String from, String to) {
        if (from.equalsIgnoreCase(to)) return BigDecimal.ONE;

        var response = webClient.get()
                .uri("/latest?from={from}&to={to}", from, to)
                .retrieve()
                .bodyToMono(FrankfurterResponse.class)
                .block();

        if (response == null || response.rates() == null || !response.rates().containsKey(to)) {
            throw new IllegalArgumentException(
                    "Could not fetch exchange rate from %s to %s".formatted(from, to));
        }
        return response.rates().get(to);
    }

    record FrankfurterResponse(String base, String date, Map<String, BigDecimal> rates) {}
}
