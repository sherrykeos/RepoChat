package devPilot.backend.ai.embedding.provider;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.stereotype.Component;

import devPilot.backend.ai.embedding.EmbeddingModelProvider;
import lombok.RequiredArgsConstructor;

/**
 * Google Gemini implementation of {@link EmbeddingModelProvider}.
 */
@Component
@RequiredArgsConstructor
public class GeminiEmbeddingModelProvider implements EmbeddingModelProvider {

    public static final String PROVIDER_NAME = "gemini";

    private final GoogleGenAiTextEmbeddingModel googleGenAiTextEmbeddingModel;

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public EmbeddingModel getEmbeddingModel() {
        return googleGenAiTextEmbeddingModel;
    }
}
