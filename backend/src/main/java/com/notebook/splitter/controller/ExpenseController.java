package com.notebook.splitter.controller;

import com.notebook.splitter.dto.ExpenseDto;
import com.notebook.splitter.dto.ExpenseRequest;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.security.CurrentUserUtil;
import com.notebook.splitter.service.ExpenseService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@PathVariable Long groupId,
                                                      @Valid @RequestBody ExpenseRequest req,
                                                      HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(expenseService.createExpense(groupId, req, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> listExpenses(@PathVariable Long groupId, HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(expenseService.getExpensesForGroup(groupId, user.getId()));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long groupId,
                                               @PathVariable Long expenseId,
                                               HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        expenseService.deleteExpense(groupId, expenseId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
