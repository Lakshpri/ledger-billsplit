package com.notebook.splitter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Records that one member paid another to settle a debt (fully or partially).
 * This is what powers the "Settlement history" page.
 */
@Entity
@Table(name = "settlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user", nullable = false)
    private User fromUser; // the person paying

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user", nullable = false)
    private User toUser; // the person receiving

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    // Snapshot of the exchange rate (this currency -> group's base currency) at settle time.
    @Column(name = "exchange_rate_to_base", nullable = false, precision = 18, scale = 8)
    @Builder.Default
    private java.math.BigDecimal exchangeRateToBase = java.math.BigDecimal.ONE;

    @Column(length = 255)
    private String note;

    @Column(name = "settled_at", nullable = false)
    private Instant settledAt;

    @PrePersist
    protected void onCreate() {
        if (this.settledAt == null) {
            this.settledAt = Instant.now();
        }
    }
}
