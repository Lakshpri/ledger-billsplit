package com.notebook.splitter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private String description;
    private String category;
    private BigDecimal amount;
    private String currency;
    private BigDecimal exchangeRateToBase;
    private UserDto paidBy;
    private LocalDate expenseDate;
    private Instant createdAt;
    private List<SplitDto> splits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SplitDto {
        private UserDto user;
        private BigDecimal shareAmount;
    }
}
