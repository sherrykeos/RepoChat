package devPilot.backend.ai.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import devPilot.backend.ai.embedding.EmbeddingModelRouter;
import devPilot.backend.ai.embedding.RoutingEmbeddingModel;

/**
 * Spring configuration for AI infrastructure.
 *
 * <p>Registers a {@code @Primary} {@link EmbeddingModel} bean backed by {@link RoutingEmbeddingModel}
 * so that vector store auto-configurations (e.g. PgVectorStore) route through {@link EmbeddingModelRouter}.
 */
@Configuration
public class AiConfiguration {

    @Bean
    @Primary
    public EmbeddingModel primaryEmbeddingModel(EmbeddingModelRouter embeddingModelRouter) {
        return new RoutingEmbeddingModel(embeddingModelRouter);
    }
}
