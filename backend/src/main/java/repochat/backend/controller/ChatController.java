package repochat.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import repochat.backend.dto.ChatMessageRequest;
import repochat.backend.dto.ChatMessageResponse;
import repochat.backend.dto.ChatSessionResponse;
import repochat.backend.dto.CreateChatSessionRequest;
import repochat.backend.dto.UpdateChatSessionRequest;
import repochat.backend.security.CurrentUser;
import repochat.backend.services.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final CurrentUser currentUser;
    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> createSession(
            @Valid @RequestBody CreateChatSessionRequest request) {
        UUID userId = currentUser.require().getId();
        return ResponseEntity.ok(chatService.createSession(userId, request));
    }

    @GetMapping("/sessions")
    public List<ChatSessionResponse> listSessions(@RequestParam UUID repositoryId) {
        UUID userId = currentUser.require().getId();
        return chatService.listSessions(userId, repositoryId);
    }

    @GetMapping("/sessions/{id}")
    public List<ChatMessageResponse> getMessages(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return chatService.getMessages(userId, id);
    }

    @PostMapping(value = "/sessions/{id}/messages", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody ChatMessageRequest request) {
        UUID userId = currentUser.require().getId();
        return chatService.streamReply(userId, id, request.content());
    }

    @PostMapping("/sessions/{id}/error")
    public ResponseEntity<ChatMessageResponse> persistErrorMessage(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID userId = currentUser.require().getId();
        String errorMessage = body.getOrDefault("error", "Unknown error");
        return ResponseEntity.ok(chatService.saveErrorMessage(userId, id, errorMessage));
    }

    @PatchMapping("/sessions/{id}")
    public ResponseEntity<ChatSessionResponse> renameSession(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateChatSessionRequest request) {
        UUID userId = currentUser.require().getId();
        return ResponseEntity.ok(chatService.renameSession(userId, id, request.title()));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        chatService.deleteSession(userId, id);
        return ResponseEntity.noContent().build();
    }
}