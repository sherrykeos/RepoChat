package repochat.backend.ai.embedding;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Default implementation of {@link EmbeddingModelRouter} that dynamically resolves
 * the configured {@link EmbeddingModelProvider} based on the {@code ai.embedding.provider} property.
 */
@Component
public class DefaultEmbeddingModelRouter implements EmbeddingModelRouter {

    private final Map<String, EmbeddingModelProvider> providers;
    private final String activeProvider;

    public DefaultEmbeddingModelRouter(
            List<EmbeddingModelProvider> providerList,
            @Value("${ai.embedding.provider:openai}") String activeProvider) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toLowerCase().trim(),
                        Function.identity()
                ));
        this.activeProvider = activeProvider.toLowerCase().trim();
    }

    @Override
    public EmbeddingModel getModel() {
        EmbeddingModelProvider provider = providers.get(activeProvider);
        if (provider == null) {
            throw new IllegalArgumentException(
                    "Unsupported embedding provider: '" + activeProvider +
                    "'. Supported providers: " + providers.keySet()
            );
        }
        return provider.getEmbeddingModel();
    }
}
