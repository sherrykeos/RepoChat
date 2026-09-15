package devPilot.backend.services;

import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import devPilot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import devPilot.backend.entity.User;
import java.util.UUID;


@Service 
@RequiredArgsConstructor

public class UserService {
    public final UserRepository userRepository;
    public final TextEncryptor tokenEncryptor;
    

    @Transactional(readOnly = true)
    public User requiredById(UUID id){
        return userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User not found"));
    }
    
    public String decryptAccessToken(User user){
        return tokenEncryptor.decrypt(user.getAccessToken());
    }

    
}
