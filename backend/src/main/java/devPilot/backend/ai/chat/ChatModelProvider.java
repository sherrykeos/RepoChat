package devPilot.backend.ai.chat;

import org.springframework.ai.chat.model.ChatModel;

/**
 * SPI for registering a chat model provider with the {@link ChatModelRouter}.
 */
public interface ChatModelProvider {

    /**
     * Unique identifier for this provider (e.g. "openai", "gemini").
     *
     * @return provider name in lowercase
     */
    String getProviderName();

    /**
     * Returns the underlying {@link ChatModel} for this provider.
     *
     * @return provider chat model
     */
    ChatModel getChatModel();
}
