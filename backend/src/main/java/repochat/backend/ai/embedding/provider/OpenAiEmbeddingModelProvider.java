package repochat.backend.ai.embedding.provider;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.stereotype.Component;

import repochat.backend.ai.embedding.EmbeddingModelProvider;
import lombok.RequiredArgsConstructor;

/**
 * OpenAI implementation of {@link EmbeddingModelProvider}.
 */
@Component
@RequiredArgsConstructor
public class OpenAiEmbeddingModelProvider implements EmbeddingModelProvider {

    public static final String PROVIDER_NAME = "openai";

    private final OpenAiEmbeddingModel openAiEmbeddingModel;

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public EmbeddingModel getEmbeddingModel() {
        return openAiEmbeddingModel;
    }
}
