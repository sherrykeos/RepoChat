package repochat.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import repochat.backend.security.crypto.VersionedTokenEncryptor;

@Configuration
public class CryptoConfig {

    @Bean
    public TextEncryptor tokenEncryptor(
            @Value("${app.token-encryptor-password}") String password,
            @Value("${app.token-encryptor-salt}") String salt) {
        return new VersionedTokenEncryptor(password, salt);
    }
}