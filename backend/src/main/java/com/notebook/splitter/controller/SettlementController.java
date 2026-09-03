package com.notebook.splitter.controller;

import com.notebook.splitter.dto.SettlementDto;
import com.notebook.splitter.dto.SettlementRequest;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.security.CurrentUserUtil;
import com.notebook.splitter.service.SettlementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<SettlementDto> recordSettlement(@PathVariable Long groupId,
                                                            @Valid @RequestBody SettlementRequest req,
                                                            HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(settlementService.recordSettlement(groupId, req, user.getId()));
    }

    @GetMapping
    public ResponseEntity<List<SettlementDto>> history(@PathVariable Long groupId, HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(settlementService.getHistory(groupId, user.getId()));
    }
}
