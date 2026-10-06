package repochat.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import repochat.backend.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByGithubId(Long githubId);
}
