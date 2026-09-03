package com.notebook.splitter.service;

import com.notebook.splitter.dto.SettlementDto;
import com.notebook.splitter.dto.SettlementRequest;
import com.notebook.splitter.dto.UserDto;
import com.notebook.splitter.entity.Group;
import com.notebook.splitter.entity.Settlement;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.exception.ApiException;
import com.notebook.splitter.repository.SettlementRepository;
import com.notebook.splitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;

    @Transactional
    public SettlementDto recordSettlement(Long groupId, SettlementRequest req, Long requestingUserId) {
        Group group = groupService.requireGroup(groupId);
        groupService.requireMembership(groupId, requestingUserId);

        if (req.getFromUserId().equals(req.getToUserId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A person can't settle up with themself");
        }

        groupService.requireMembership(groupId, req.getFromUserId());
        groupService.requireMembership(groupId, req.getToUserId());

        User from = userRepository.findById(req.getFromUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payer not found"));
        User to = userRepository.findById(req.getToUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Receiver not found"));

        Settlement settlement = Settlement.builder()
                .group(group)
                .fromUser(from)
                .toUser(to)
                .amount(req.getAmount())
                .currency(req.getCurrency().toUpperCase())
                .exchangeRateToBase(req.getExchangeRateToBase() == null ? BigDecimal.ONE : req.getExchangeRateToBase())
                .note(req.getNote())
                .build();

        settlement = settlementRepository.save(settlement);
        return toDto(settlement);
    }

    public List<SettlementDto> getHistory(Long groupId, Long requestingUserId) {
        groupService.requireMembership(groupId, requestingUserId);
        return settlementRepository.findByGroupIdOrderBySettledAtDesc(groupId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private SettlementDto toDto(Settlement s) {
        return SettlementDto.builder()
                .id(s.getId())
                .fromUser(UserDto.from(s.getFromUser()))
                .toUser(UserDto.from(s.getToUser()))
                .amount(s.getAmount())
                .currency(s.getCurrency())
                .note(s.getNote())
                .settledAt(s.getSettledAt())
                .build();
    }
}
