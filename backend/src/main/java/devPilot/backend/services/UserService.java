package devPilot.backend.services;

import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import devPilot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import devPilot.backend.entity.User;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class UserService {
    public final UserRepository userRepository;
    public final TextEncryptor tokenEncryptor;


    @Transactional
    public User upsertFromGitHub(Map<String, Object> attributes, String accessToken, String scopes) {
        Long githubId = toLong(attributes.get("id"));
        String login = String.valueOf(attributes.get("login"));
        String name = attributes.get("name") != null
                ? String.valueOf(attributes.get("name"))
                : login;
        String avatarUrl = attributes.get("avatar_url") != null
                ? String.valueOf(attributes.get("avatar_url"))
                : null;

        String encryptedToken = tokenEncryptor.encrypt(accessToken);

        User user = userRepository.findByGithubId(githubId).orElseGet(User::new);
        user.setGithubId(githubId);
        user.setGithubusername(login);
        user.setDisplayName(name);
        user.setAvatarUrl(avatarUrl);
        user.setAccessToken(encryptedToken);
        user.setTokenScopes(scopes);
        return userRepository.save(user);
    }

    private Long toLong(Object obj) {
        if (obj instanceof Number number) {
            return number.longValue();
        }
        if (obj instanceof String str) {
            return Long.parseLong(str);
        }
        throw new IllegalArgumentException("Cannot convert " + obj + " to Long");
    }

    @Transactional(readOnly = true)
    public User requiredById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public String decryptAccessToken(User user) {
        return tokenEncryptor.decrypt(user.getAccessToken());
    }


}
