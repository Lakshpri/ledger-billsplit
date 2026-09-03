package com.notebook.splitter.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A small, static list of common currencies for the frontend's dropdowns.
 * In a real app you'd likely swap this for a live exchange-rate API
 * (e.g. exchangerate.host or openexchangerates.org).
 */
@RestController
@RequestMapping("/api/currencies")
public class CurrencyController {

    @GetMapping
    public Map<String, String> listCurrencies() {
        Map<String, String> currencies = new LinkedHashMap<>();
        currencies.put("USD", "US Dollar");
        currencies.put("EUR", "Euro");
        currencies.put("GBP", "British Pound");
        currencies.put("INR", "Indian Rupee");
        currencies.put("JPY", "Japanese Yen");
        currencies.put("AUD", "Australian Dollar");
        currencies.put("CAD", "Canadian Dollar");
        currencies.put("SGD", "Singapore Dollar");
        currencies.put("AED", "UAE Dirham");
        currencies.put("CNY", "Chinese Yuan");
        return currencies;
    }
}
