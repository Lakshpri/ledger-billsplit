package com.notebook.splitter.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SettlementRequest {
    @NotNull(message = "fromUserId is required")
    private Long fromUserId;

    @NotNull(message = "toUserId is required")
    private Long toUserId;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank
    private String currency;

    // Exchange rate from this settlement's currency to the group's base currency (defaults to 1)
    private BigDecimal exchangeRateToBase;

    private String note;
}
