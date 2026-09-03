package com.notebook.splitter.controller;

import com.notebook.splitter.dto.GroupDto;
import com.notebook.splitter.dto.GroupRequest;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.security.CurrentUserUtil;
import com.notebook.splitter.service.GroupService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final CurrentUserUtil currentUserUtil;

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(@Valid @RequestBody GroupRequest req, HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(groupService.createGroup(req, user));
    }

    @GetMapping
    public ResponseEntity<List<GroupDto>> myGroups(HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(groupService.getGroupsForUser(user.getId()));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDto> getGroup(@PathVariable Long groupId, HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(groupService.getGroup(groupId, user.getId()));
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupDto> addMember(@PathVariable Long groupId,
                                               @RequestBody Map<String, String> body,
                                               HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(groupService.addMemberByEmail(groupId, body.get("email"), user.getId()));
    }
}
