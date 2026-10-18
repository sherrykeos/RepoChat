package repochat.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import repochat.backend.dto.ChatMessageResponse;
import repochat.backend.dto.ChatSessionResponse;
import repochat.backend.dto.CreateChatSessionRequest;
import repochat.backend.entity.ChatMessage;
import repochat.backend.entity.ChatSession;
import repochat.backend.entity.IndexStatus;
import repochat.backend.entity.MessageRole;
import repochat.backend.entity.Repository;
import repochat.backend.exceptions.BadRequestException;
import repochat.backend.exceptions.NotFoundException;
import repochat.backend.repository.ChatMessageRepository;
import repochat.backend.repository.ChatSessionRepository;
import repochat.backend.services.ai.ChatPromptBuilder;
import repochat.backend.services.ai.ChatStreamHandler;
import repochat.backend.services.ai.ChatTitleExtractor;
import repochat.backend.services.ai.CitationMapper;
import repochat.backend.services.ai.CodeContextRetriever;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Chat sessions and the RAG chat pipeline entry point.
 *
 * <p>{@link #streamReply} orchestrates the full flow:
 * validate → save user message → retrieve code context → build prompts → stream AI reply.
 * Each step is implemented in a dedicated class under {@code service.ai}.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RepoService repoService;
    private final CodeContextRetriever codeContextRetriever;
    private final ChatPromptBuilder chatPromptBuilder;
    private final ChatStreamHandler chatStreamHandler;
    private final CitationMapper citationMapper;

    @Transactional
    public ChatSessionResponse createSession(UUID userId, CreateChatSessionRequest request) {
        Repository repo = repoService.requireOwned(request.repositoryId(), userId);
        if (repo.getIndexStatus() != IndexStatus.READY) {
            throw new BadRequestException("Repository must be indexed before chatting");
        }

        String title = request.title() != null && !request.title().isBlank()
                ? request.title().trim()
                : "New Chat";

        ChatSession session = ChatSession.builder()
                .userId(userId)
                .repositoryId(repo.getId())
                .title(title)
                .build();
        session = chatSessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> listSessions(UUID userId, UUID repositoryId) {
        repoService.requireOwned(repositoryId, userId);
        return chatSessionRepository
                .findByUserIdAndRepositoryIdOrderByCreatedAtDesc(userId, repositoryId)
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID userId, UUID sessionId) {
        ChatSession session = requireSession(userId, sessionId);
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatSession requireSession(UUID userId, UUID sessionId) {
        return chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new NotFoundException("Chat session not found"));
    }

    @Transactional
    public ChatSessionResponse renameSession(UUID userId, UUID sessionId, String newTitle) {
        ChatSession session = requireSession(userId, sessionId);
        if (newTitle == null || newTitle.isBlank()) {
            throw new BadRequestException("Session title cannot be empty");
        }
        session.setTitle(newTitle.trim());
        session = chatSessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Transactional
    public void deleteSession(UUID userId, UUID sessionId) {
        ChatSession session = requireSession(userId, sessionId);
        chatMessageRepository.deleteBySessionId(session.getId());
        chatSessionRepository.delete(session);
    }

    public SseEmitter streamReply(UUID userId, UUID sessionId, String userContent) {
        // 1. Ensure the session exists and the repo is indexed
        ChatSession session = requireSession(userId, sessionId);
        Repository repo = repoService.requireOwned(session.getRepositoryId(), userId);
        if (repo.getIndexStatus() != IndexStatus.READY) {
            throw new BadRequestException("Repository is not ready for chat");
        }

        // Auto-rename session if it has default title ("New Chat", "Untitled chat", or "Chat with ...")
        String updatedTitle = null;
        if (ChatTitleExtractor.isDefaultTitle(session.getTitle())) {
            updatedTitle = ChatTitleExtractor.extractTitleEssence(userContent);
            session.setTitle(updatedTitle);
            session = chatSessionRepository.save(session);
        }

        // 2. Persist the user's message
        ChatMessage userMessage = chatMessageRepository.save(ChatMessage.builder()
                .sessionId(session.getId())
                .role(MessageRole.USER)
                .content(userContent)
                .build());

        try {
            // 3. RAG retrieval — find code chunks similar to the question
            var retrievedContext = codeContextRetriever.retrieve(repo.getId(), userContent);

            // 4. Build LLM prompts from retrieved context + question
            String systemPrompt = chatPromptBuilder.systemPrompt(repo.getFullName());
            String userPrompt = chatPromptBuilder.userPrompt(retrievedContext.contextText(), userContent);

            // 5. Stream AI model response to the client (SSE)
            return chatStreamHandler.stream(
                    session.getId(),
                    toMessageResponse(userMessage),
                    retrievedContext.citations(),
                    systemPrompt,
                    userPrompt,
                    updatedTitle);
        } catch (Exception ex) {
            String errorMsg = ex.getMessage() != null ? ex.getMessage() : "Error preparing context for AI";
            String errContent = "⚠️ " + errorMsg;
            try {
                chatMessageRepository.save(ChatMessage.builder()
                        .sessionId(session.getId())
                        .role(MessageRole.ASSISTANT)
                        .content(errContent)
                        .citations("[]")
                        .build());
            } catch (Exception saveEx) {
                
                log.error("Failed to save error message for session {}", sessionId, saveEx);
            }

            SseEmitter errorEmitter = new SseEmitter(10000L);
            try {
                if (updatedTitle != null) {
                    errorEmitter.send(SseEmitter.event()
                            .name("session_updated")
                            .data("{\"id\":\"" + sessionId + "\",\"title\":\"" + updatedTitle.replace("\"", "\\\"") + "\"}"));
                }
                errorEmitter.send(SseEmitter.event()
                        .name("user_message")
                        .data(toMessageResponse(userMessage)));
                errorEmitter.send(SseEmitter.event()
                        .name("error")
                        .data("\"" + errorMsg.replace("\"", "\\\"") + "\""));
            } catch (Exception ignored) { }
            errorEmitter.completeWithError(ex);
            return errorEmitter;
        }
    }

    @Transactional
    public ChatMessageResponse saveErrorMessage(UUID userId, UUID sessionId, String errorMessage) {
        ChatSession session = requireSession(userId, sessionId);
        String content = errorMessage.startsWith("⚠️") ? errorMessage : "⚠️ " + errorMessage;
        ChatMessage message = chatMessageRepository.save(ChatMessage.builder()
                .sessionId(session.getId())
                .role(MessageRole.ASSISTANT)
                .content(content)
                .citations("[]")
                .build());
        return toMessageResponse(message);
    }

    private ChatSessionResponse toSessionResponse(ChatSession session) {
        return new ChatSessionResponse(
                session.getId(),
                session.getRepositoryId(),
                session.getTitle(),
                session.getCreatedAt());
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