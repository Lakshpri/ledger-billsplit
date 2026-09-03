package com.notebook.splitter.controller;

import com.notebook.splitter.dto.BalanceDto;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.security.CurrentUserUtil;
import com.notebook.splitter.service.BalanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups/{groupId}/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<BalanceDto> getBalances(@PathVariable Long groupId, HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(balanceService.getGroupBalances(groupId, user.getId()));
    }
}
