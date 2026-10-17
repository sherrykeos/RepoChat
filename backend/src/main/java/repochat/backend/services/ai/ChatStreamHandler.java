package repochat.backend.services.ai;

import java.util.List;
import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.fasterxml.jackson.databind.ObjectMapper;

import repochat.backend.ai.chat.ChatModelRouter;
import repochat.backend.dto.ChatMessageResponse;
import repochat.backend.dto.CitationDto;
import repochat.backend.entity.ChatMessage;
import repochat.backend.entity.MessageRole;
import repochat.backend.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Generation step: call the active LLM via ChatModelRouter and stream tokens to the browser over SSE.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatStreamHandler {

    private final ChatModelRouter chatModelRouter;
    private final ChatMessageRepository chatMessageRepository;
    private final CitationMapper citationMapper;
    private final ObjectMapper objectMapper;

    public SseEmitter stream(
            UUID sessionId,
            ChatMessageResponse savedUserMessage,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt,
            String updatedTitle) {

        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();

        try {
            if (updatedTitle != null) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("session_updated")
                            .data(toJson(java.util.Map.of("id", sessionId.toString(), "title", updatedTitle))));
                } catch (Exception ignored) {
                }
            }

            emitter.send(SseEmitter.event()
                    .name("user_message")
                    .data(toJson(savedUserMessage)));

            ChatClient.builder(chatModelRouter.getModel())
                    .build()
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .stream()
                    .content()
                    .doOnNext(token -> appendToken(emitter, fullReply, token))
                    .doOnError(err -> {
                        log.error("Chat stream error for session {}", sessionId, err);
                        String detailedMsg = extractErrorMessage(err);
                        String errContent = "⚠️ " + detailedMsg;
                        try {
                            ChatMessage savedErr = chatMessageRepository.save(ChatMessage.builder()
                                    .sessionId(sessionId)
                                    .role(MessageRole.ASSISTANT)
                                    .content(errContent)
                                    .citations("[]")
                                    .build());
                            try {
                                emitter.send(SseEmitter.event()
                                        .name("assistant_message")
                                        .data(toJson(toMessageResponse(savedErr))));
                            } catch (Exception ignored) {
                            }
                        } catch (Exception saveEx) {
                            log.error("Failed to save error message to database for session {}", sessionId, saveEx);
                        }
                        try {
                            emitter.send(SseEmitter.event()
                                    .name("error")
                                    .data(toJson(detailedMsg)));
                        } catch (Exception ignored) {
                        }
                        emitter.completeWithError(err);
                    })
                    .doOnComplete(() -> completeStream(
                            emitter, sessionId, fullReply, citations))
                    .subscribe();
        } catch (Exception ex) {
            log.error("Error initializing chat stream for session {}", sessionId, ex);
            String detailedMsg = extractErrorMessage(ex);
            String errContent = "⚠️ " + detailedMsg;
            try {
                ChatMessage savedErr = chatMessageRepository.save(ChatMessage.builder()
                        .sessionId(sessionId)
                        .role(MessageRole.ASSISTANT)
                        .content(errContent)
                        .citations("[]")
                        .build());
                try {
                    emitter.send(SseEmitter.event()
                            .name("assistant_message")
                            .data(toJson(toMessageResponse(savedErr))));
                } catch (Exception ignored) {
                }
            } catch (Exception saveEx) {
                log.error("Failed to save error message to database for session {}", sessionId, saveEx);
            }
            try {
                emitter.send(SseEmitter.event()
                        .name("error")
                        .data(toJson(detailedMsg)));
            } catch (Exception ignored) {
            }
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    private String extractErrorMessage(Throwable t) {
        if (t == null) return "AI service encountered an unexpected error.";
        
        // Traverse cause chain to find the most informative message
        Throwable current = t;
        String bestMessage = t.getMessage();
        while (current != null) {
            String msg = current.getMessage();
            if (msg != null && !msg.isBlank()) {
                bestMessage = msg;
                if (msg.contains("429") || msg.toLowerCase().contains("quota") || msg.toLowerCase().contains("resource_exhausted")) {
                    return "Rate limit / Quota exceeded: The AI model quota has been reached on this API key.\n\n**Details**: " + msg + "\n\n💡 *Tip: Wait a moment or configure `GEMINI_CHAT_MODEL=gemini-3.5-flash` in `backend/.env`.*";
                }
                if (msg.contains("404") || msg.toLowerCase().contains("not found")) {
                    return "Model not found: " + msg + "\n\n💡 *Tip: Verify that the configured model name is available in your Gemini region.*";
                }
                if (msg.contains("401") || msg.contains("403") || msg.toLowerCase().contains("api key")) {
                    return "Authentication error: " + msg + "\n\n💡 *Tip: Please verify your `GEMINI_API_KEY`.*";
                }
            }
            current = current.getCause();
        }

        return bestMessage != null && !bestMessage.isBlank() ? bestMessage : "AI response error occurred: " + t.getClass().getSimpleName();
    }

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        fullReply.append(token);
        try {
            emitter.send(SseEmitter.event()
                    .name("token")
                    .data(toJson(token)));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void completeStream(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations) {
        try {
            ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT)
                    .content(fullReply.toString())
                    .citations(citationMapper.toJson(citations))
                    .build());

            emitter.send(SseEmitter.event()
                    .name("assistant_message")
                    .data(toJson(toMessageResponse(assistant))));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Failed to serialize SSE payload to JSON", e);
            return String.valueOf(obj);
        }
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                citationMapper.fromJson(message.getCitations()),
                message.getCreatedAt());
    }
}