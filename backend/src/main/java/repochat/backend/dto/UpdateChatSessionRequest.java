package repochat.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateChatSessionRequest(
        @NotBlank String title) {
}
