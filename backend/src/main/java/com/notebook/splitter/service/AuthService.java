package com.notebook.splitter.service;

import com.notebook.splitter.dto.AuthResponse;
import com.notebook.splitter.dto.LoginRequest;
import com.notebook.splitter.dto.RegisterRequest;
import com.notebook.splitter.dto.UserDto;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.exception.ApiException;
import com.notebook.splitter.repository.UserRepository;
import com.notebook.splitter.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    // A friendly palette of sticky-note colors handed out to new users round-robin
    private static final List<String> AVATAR_COLORS = List.of(
            "#FFE28A", "#FFB4A2", "#A7D7C5", "#B7C9F2", "#F6C7DE", "#D9C7A3"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        String color = AVATAR_COLORS.get((int) (userRepository.count() % AVATAR_COLORS.size()));

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .avatarColor(color)
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return AuthResponse.builder().token(token).user(UserDto.from(user)).build();
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return AuthResponse.builder().token(token).user(UserDto.from(user)).build();
    }
}
