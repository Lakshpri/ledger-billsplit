package com.notebook.splitter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(nullable = false, length = 150)
    private String description;

    // Category emoji/tag, e.g. "Food", "Travel", "Rent", "Fun"
    @Column(length = 30)
    @Builder.Default
    private String category = "General";

    // Original amount, in the currency it was actually paid in
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    // Snapshot of the exchange rate (this currency -> group's base currency) at expense time,
    // so historical amounts never shift even if today's live rate changes.
    @Column(name = "exchange_rate_to_base", nullable = false, precision = 18, scale = 8)
    @Builder.Default
    private BigDecimal exchangeRateToBase = BigDecimal.ONE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExpenseSplit> splits = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.expenseDate == null) {
            this.expenseDate = LocalDate.now();
        }
    }

    /** Amount converted into the group's base currency, for balance math. */
    @Transient
    public BigDecimal getAmountInBase() {
        return amount.multiply(exchangeRateToBase);
    }
}
