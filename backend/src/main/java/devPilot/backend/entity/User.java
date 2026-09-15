package devPilot.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.Column;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")

public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubId;

    @Column(name = "githubusername", nullable = false, unique = true)
    private String githubusername;

    @Column(name = "displayName", nullable = false )
    private String displayName;

    @Column(name = "avatarUrl", length = 500)
    private String avatarUrl;

    @Column(name = "accessToken", nullable = false, columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "tokenScopes", length = 500)
    private String tokenScopes;

    @Column(name = "createdAt", nullable = false, updatable = false)
    private Instant createdAt;
    
    @PrePersist
    void onCreate(){
        if(createdAt == null){
            createdAt = Instant.now();
        }
    }


}
