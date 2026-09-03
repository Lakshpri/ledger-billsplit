package com.notebook.splitter.service;

import com.notebook.splitter.dto.ExpenseDto;
import com.notebook.splitter.dto.ExpenseRequest;
import com.notebook.splitter.dto.UserDto;
import com.notebook.splitter.entity.Expense;
import com.notebook.splitter.entity.ExpenseSplit;
import com.notebook.splitter.entity.Group;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.exception.ApiException;
import com.notebook.splitter.repository.ExpenseRepository;
import com.notebook.splitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;

    @Transactional
    public ExpenseDto createExpense(Long groupId, ExpenseRequest req, Long requestingUserId) {
        Group group = groupService.requireGroup(groupId);
        groupService.requireMembership(groupId, requestingUserId);

        User paidBy = userRepository.findById(req.getPaidByUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payer not found"));
        groupService.requireMembership(groupId, paidBy.getId());

        Expense expense = Expense.builder()
                .group(group)
                .description(req.getDescription())
                .category((req.getCategory() == null || req.getCategory().isBlank()) ? "General" : req.getCategory())
                .amount(req.getAmount())
                .currency(req.getCurrency().toUpperCase())
                .exchangeRateToBase(req.getExchangeRateToBase() == null ? BigDecimal.ONE : req.getExchangeRateToBase())
                .paidBy(paidBy)
                .expenseDate(req.getExpenseDate())
                .build();

        List<ExpenseSplit> splits = buildSplits(expense, req, groupId);
        validateSplitsSumToAmount(req.getAmount(), splits);
        expense.setSplits(splits);

        expense = expenseRepository.save(expense);
        return toDto(expense);
    }

    /** Builds the list of ExpenseSplit entities according to the requested split strategy. */
    private List<ExpenseSplit> buildSplits(Expense expense, ExpenseRequest req, Long groupId) {
        String splitType = req.getSplitType() == null ? "EQUAL" : req.getSplitType().toUpperCase();
        List<ExpenseSplit> splits = new ArrayList<>();

        switch (splitType) {
            case "EQUAL" -> {
                List<Long> participantIds = req.getParticipantUserIds();
                if (participantIds == null || participantIds.isEmpty()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Pick at least one participant to split equally");
                }
                for (Long uid : participantIds) {
                    groupService.requireMembership(groupId, uid);
                }
                int n = participantIds.size();
                BigDecimal equalShare = req.getAmount()
                        .divide(BigDecimal.valueOf(n), 2, RoundingMode.DOWN);
                BigDecimal distributed = equalShare.multiply(BigDecimal.valueOf(n));
                BigDecimal remainder = req.getAmount().subtract(distributed); // leftover cents

                for (int i = 0; i < n; i++) {
                    Long uid = participantIds.get(i);
                    User u = userRepository.findById(uid)
                            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Participant not found"));
                    BigDecimal share = equalShare;
                    // give the leftover pennies to the first participant(s) so totals match exactly
                    if (i == 0) {
                        share = share.add(remainder);
                    }
                    splits.add(ExpenseSplit.builder().expense(expense).user(u).shareAmount(share).build());
                }
            }
            case "EXACT" -> {
                requireSplitEntries(req);
                for (ExpenseRequest.SplitEntry entry : req.getSplits()) {
                    groupService.requireMembership(groupId, entry.getUserId());
                    User u = userRepository.findById(entry.getUserId())
                            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Participant not found"));
                    splits.add(ExpenseSplit.builder().expense(expense).user(u).shareAmount(entry.getValue()).build());
                }
            }
            case "PERCENTAGE" -> {
                requireSplitEntries(req);
                BigDecimal totalPercent = req.getSplits().stream()
                        .map(ExpenseRequest.SplitEntry::getValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (totalPercent.compareTo(BigDecimal.valueOf(100)) != 0) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Percentages must add up to 100");
                }

                for (ExpenseRequest.SplitEntry entry : req.getSplits()) {
                    groupService.requireMembership(groupId, entry.getUserId());
                    User u = userRepository.findById(entry.getUserId())
                            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Participant not found"));
                    BigDecimal share = req.getAmount()
                            .multiply(entry.getValue())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    splits.add(ExpenseSplit.builder().expense(expense).user(u).shareAmount(share).build());
                }
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown split type: " + splitType);
        }

        return splits;
    }

    private void requireSplitEntries(ExpenseRequest req) {
        if (req.getSplits() == null || req.getSplits().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Provide a split value for each participant");
        }
    }

    private void validateSplitsSumToAmount(BigDecimal amount, List<ExpenseSplit> splits) {
        BigDecimal sum = splits.stream().map(ExpenseSplit::getShareAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sum.setScale(2, RoundingMode.HALF_UP).compareTo(amount.setScale(2, RoundingMode.HALF_UP)) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Splits (" + sum + ") don't add up to the total amount (" + amount + ")");
        }
    }

    public List<ExpenseDto> getExpensesForGroup(Long groupId, Long requestingUserId) {
        groupService.requireMembership(groupId, requestingUserId);
        return expenseRepository.findByGroupIdOrderByExpenseDateDescCreatedAtDesc(groupId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteExpense(Long groupId, Long expenseId, Long requestingUserId) {
        groupService.requireMembership(groupId, requestingUserId);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Expense not found"));
        if (!expense.getGroup().getId().equals(groupId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Expense does not belong to this group");
        }
        expenseRepository.delete(expense);
    }

    private ExpenseDto toDto(Expense e) {
        List<ExpenseDto.SplitDto> splitDtos = e.getSplits().stream()
                .map(s -> ExpenseDto.SplitDto.builder()
                        .user(UserDto.from(s.getUser()))
                        .shareAmount(s.getShareAmount())
                        .build())
                .collect(Collectors.toList());

        return ExpenseDto.builder()
                .id(e.getId())
                .description(e.getDescription())
                .category(e.getCategory())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .exchangeRateToBase(e.getExchangeRateToBase())
                .paidBy(UserDto.from(e.getPaidBy()))
                .expenseDate(e.getExpenseDate())
                .createdAt(e.getCreatedAt())
                .splits(splitDtos)
                .build();
    }
}
