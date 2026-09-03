package com.notebook.splitter.controller;

import com.notebook.splitter.dto.UserDto;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.security.CurrentUserUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final CurrentUserUtil currentUserUtil;

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(HttpServletRequest request) {
        User user = currentUserUtil.getCurrentUser(request);
        return ResponseEntity.ok(UserDto.from(user));
    }
}
