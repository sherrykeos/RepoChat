package repochat.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import repochat.backend.dto.UserResponse;
import repochat.backend.entity.User;
import repochat.backend.security.AppUserPrincipal;
import repochat.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final CurrentUser currentUser;

    @GetMapping("/login-url")
    public Map<String, String> loginUrl() {
        return Map.of("url", "/oauth2/authorization/github");
    }


    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        AppUserPrincipal principal = currentUser.require();
        User user = principal.getUser();
        return ResponseEntity.ok(new UserResponse(
                user.getId(),
                user.getGithubId(),
                user.getGithubusername(),
                user.getDisplayName(),
                user.getAvatarUrl()));
    }
    
}