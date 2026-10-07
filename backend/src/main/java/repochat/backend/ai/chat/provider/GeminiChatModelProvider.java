package repochat.backend.ai.chat.provider;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.stereotype.Component;

import repochat.backend.ai.chat.ChatModelProvider;


/**
 * Google Gemini implementation of {@link ChatModelProvider}.
 */
@Component
public class GeminiChatModelProvider implements ChatModelProvider {

    public static final String PROVIDER_NAME = "gemini";

    private final GoogleGenAiChatModel googleGenAiChatModel;

    public GeminiChatModelProvider(GoogleGenAiChatModel googleGenAiChatModel) {
        this.googleGenAiChatModel = googleGenAiChatModel;
    }

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public ChatModel getChatModel() {
        return googleGenAiChatModel;
    }
}
