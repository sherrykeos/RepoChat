package devPilot.backend.ai.chat.provider;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Component;

import devPilot.backend.ai.chat.ChatModelProvider;
import lombok.RequiredArgsConstructor;

/**
 * OpenAI implementation of {@link ChatModelProvider}.
 */
@Component
@RequiredArgsConstructor
public class OpenAiChatModelProvider implements ChatModelProvider {

    public static final String PROVIDER_NAME = "openai";

    private final OpenAiChatModel openAiChatModel;

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public ChatModel getChatModel() {
        return openAiChatModel;
    }
}
