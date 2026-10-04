package devPilot.backend.ai.chat;

import org.springframework.ai.chat.model.ChatModel;

/**
 * Provider-independent router for obtaining the configured chat / reasoning model.
 */
public interface ChatModelRouter {

    /**
     * Returns the active {@link ChatModel} as determined by configuration.
     *
     * @return the configured chat model
     */
    ChatModel getModel();
}
