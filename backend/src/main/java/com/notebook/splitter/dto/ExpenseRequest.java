package com.notebook.splitter.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ExpenseRequest {
    @NotBlank(message = "Description is required")
    private String description;

    private String category;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required, e.g. USD")
    private String currency;

    // Exchange rate from this expense's currency to the group's base currency.
    // Defaults to 1 (same currency) if not supplied.
    private BigDecimal exchangeRateToBase;

    @NotNull(message = "paidByUserId is required")
    private Long paidByUserId;

    private LocalDate expenseDate;

    // "EQUAL", "EXACT", or "PERCENTAGE"
    @NotBlank
    private String splitType;

    // Which members participate (userId list) - required for EQUAL split.
    private List<Long> participantUserIds;

    // For EXACT split: exact amount owed per user (in the expense currency).
    // For PERCENTAGE split: percentage (0-100) owed per user.
    private List<SplitEntry> splits;

    @Data
    public static class SplitEntry {
        private Long userId;
        private BigDecimal value;
    }
}
