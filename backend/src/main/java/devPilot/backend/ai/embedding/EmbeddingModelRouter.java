package devPilot.backend.ai.embedding;

import org.springframework.ai.embedding.EmbeddingModel;

/**
 * Provider-independent router for obtaining the configured embedding model.
 */
public interface EmbeddingModelRouter {

    /**
     * Returns the active {@link EmbeddingModel} as determined by configuration.
     *
     * @return the configured embedding model
     */
    EmbeddingModel getModel();
}
