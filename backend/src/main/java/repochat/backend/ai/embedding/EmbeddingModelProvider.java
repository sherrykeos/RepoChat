package repochat.backend.ai.embedding;

import org.springframework.ai.embedding.EmbeddingModel;

/**
 * SPI for registering an embedding model provider with the {@link EmbeddingModelRouter}.
 */
public interface EmbeddingModelProvider {

    /**
     * Unique identifier for this provider (e.g. "openai", "gemini", "ollama").
     *
     * @return provider name in lowercase
     */
    String getProviderName();

    /**
     * Returns the underlying {@link EmbeddingModel} for this provider.
     *
     * @return provider embedding model
     */
    EmbeddingModel getEmbeddingModel();
}
