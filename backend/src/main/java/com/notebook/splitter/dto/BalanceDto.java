package com.notebook.splitter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Full balance picture for a group:
 *  - netBalances: how much each member is up/down overall (in base currency)
 *  - simplifiedDebts: the minimal set of payments that would settle everyone up
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceDto {
    private String baseCurrency;
    private List<MemberBalance> netBalances;
    private List<SimplifiedDebt> simplifiedDebts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberBalance {
        private UserDto user;
        private BigDecimal netAmount; // positive = is owed money, negative = owes money
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimplifiedDebt {
        private UserDto from; // owes money
        private UserDto to;   // is owed money
        private BigDecimal amount;
    }
}
