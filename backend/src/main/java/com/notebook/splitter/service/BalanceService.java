package com.notebook.splitter.service;

import com.notebook.splitter.dto.BalanceDto;
import com.notebook.splitter.dto.UserDto;
import com.notebook.splitter.entity.*;
import com.notebook.splitter.repository.ExpenseRepository;
import com.notebook.splitter.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Calculates "who owes whom" for a group, and simplifies it down to the
 * minimum number of payments needed to settle everyone up.
 *
 * How the math works:
 *  1. For every expense, the payer is credited the full amount (in base currency),
 *     and every participant is debited their share (in base currency).
 *  2. For every settlement already recorded, the payer's balance goes up (they've
 *     paid off some debt) and the receiver's balance goes down (they've been paid).
 *  3. The result is one "net balance" per member: positive means the group owes
 *     them money, negative means they owe the group money.
 *  4. Debt simplification then greedily matches the person owed the most against
 *     the person who owes the most, repeatedly, until everyone nets to zero.
 *     This is the same idea used by apps like Splitwise, and it minimizes the
 *     number of transactions needed compared to "everyone pays everyone" back and forth.
 */
@Service
@RequiredArgsConstructor
public class BalanceService {

    private static final BigDecimal EPSILON = new BigDecimal("0.01");

    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final GroupService groupService;

    public BalanceDto getGroupBalances(Long groupId, Long requestingUserId) {
        groupService.requireMembership(groupId, requestingUserId);
        Group group = groupService.requireGroup(groupId);

        List<User> members = groupService.membersOf(groupId);
        Map<Long, BigDecimal> net = new LinkedHashMap<>();
        Map<Long, User> usersById = new LinkedHashMap<>();
        for (User u : members) {
            net.put(u.getId(), BigDecimal.ZERO);
            usersById.put(u.getId(), u);
        }

        // 1) Apply every expense
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByExpenseDateDescCreatedAtDesc(groupId);
        for (Expense expense : expenses) {
            BigDecimal rate = expense.getExchangeRateToBase();
            Long payerId = expense.getPaidBy().getId();
            net.merge(payerId, expense.getAmount().multiply(rate), BigDecimal::add);

            for (ExpenseSplit split : expense.getSplits()) {
                Long uid = split.getUser().getId();
                BigDecimal debit = split.getShareAmount().multiply(rate);
                net.merge(uid, debit.negate(), BigDecimal::add);
            }
        }

        // 2) Apply every settlement already made
        List<Settlement> settlements = settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId);
        for (Settlement s : settlements) {
            BigDecimal rate = s.getExchangeRateToBase();
            BigDecimal amountInBase = s.getAmount().multiply(rate);
            net.merge(s.getFromUser().getId(), amountInBase, BigDecimal::add);      // payer's debt shrinks
            net.merge(s.getToUser().getId(), amountInBase.negate(), BigDecimal::add); // receiver is owed less
        }

        // Round everything to cents
        net.replaceAll((id, amt) -> amt.setScale(2, RoundingMode.HALF_UP));

        List<BalanceDto.MemberBalance> netBalances = new ArrayList<>();
        for (User u : members) {
            netBalances.add(BalanceDto.MemberBalance.builder()
                    .user(UserDto.from(u))
                    .netAmount(net.get(u.getId()))
                    .build());
        }

        List<BalanceDto.SimplifiedDebt> simplified = simplifyDebts(net, usersById);

        return BalanceDto.builder()
                .baseCurrency(group.getBaseCurrency())
                .netBalances(netBalances)
                .simplifiedDebts(simplified)
                .build();
    }

    /**
     * Greedy debt-simplification algorithm.
     *
     * Split members into creditors (net > 0, owed money) and debtors (net < 0, owe money),
     * stored in max-heaps by amount. Repeatedly take the biggest creditor and the biggest
     * debtor, settle the smaller of the two amounts between them, and push whichever side
     * still has a remaining balance back into its heap. This always terminates in at most
     * (numberOfMembers - 1) transactions.
     */
    private List<BalanceDto.SimplifiedDebt> simplifyDebts(Map<Long, BigDecimal> net, Map<Long, User> usersById) {
        PriorityQueue<Map.Entry<Long, BigDecimal>> creditors =
                new PriorityQueue<>((a, b) -> b.getValue().compareTo(a.getValue())); // largest owed first
        PriorityQueue<Map.Entry<Long, BigDecimal>> debtors =
                new PriorityQueue<>((a, b) -> a.getValue().compareTo(b.getValue())); // most negative first

        for (Map.Entry<Long, BigDecimal> entry : net.entrySet()) {
            if (entry.getValue().compareTo(EPSILON) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            } else if (entry.getValue().compareTo(EPSILON.negate()) < 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            }
        }

        List<BalanceDto.SimplifiedDebt> result = new ArrayList<>();

        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            Map.Entry<Long, BigDecimal> creditor = creditors.poll();
            Map.Entry<Long, BigDecimal> debtor = debtors.poll();

            BigDecimal owed = creditor.getValue();          // positive
            BigDecimal owedByDebtor = debtor.getValue().abs(); // positive

            BigDecimal settleAmount = owed.min(owedByDebtor).setScale(2, RoundingMode.HALF_UP);

            if (settleAmount.compareTo(EPSILON) >= 0) {
                result.add(BalanceDto.SimplifiedDebt.builder()
                        .from(UserDto.from(usersById.get(debtor.getKey())))
                        .to(UserDto.from(usersById.get(creditor.getKey())))
                        .amount(settleAmount)
                        .build());
            }

            BigDecimal creditorRemaining = owed.subtract(settleAmount);
            BigDecimal debtorRemaining = owedByDebtor.subtract(settleAmount);

            if (creditorRemaining.compareTo(EPSILON) > 0) {
                creditors.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), creditorRemaining));
            }
            if (debtorRemaining.compareTo(EPSILON) > 0) {
                debtors.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), debtorRemaining.negate()));
            }
        }

        return result;
    }
}
