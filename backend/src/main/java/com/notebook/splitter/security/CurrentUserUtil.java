package com.notebook.splitter.security;

import com.notebook.splitter.entity.User;
import com.notebook.splitter.exception.ApiException;
import com.notebook.splitter.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Small helper controllers use to fetch "who is making this request" from the
 * userId that JwtAuthFilter stashed on the HttpServletRequest.
 */
@Component
@RequiredArgsConstructor
public class CurrentUserUtil {

    private final UserRepository userRepository;

    public User getCurrentUser(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("currentUserId");
        if (userIdAttr == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "You must be logged in to do that");
        }
        Long userId = (Long) userIdAttr;
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
