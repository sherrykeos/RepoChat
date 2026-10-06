package repochat.backend.ai.chat;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Default implementation of {@link ChatModelRouter} that dynamically resolves
 * the configured {@link ChatModelProvider} based on the {@code ai.chat.provider} property.
 */
@Component
public class DefaultChatModelRouter implements ChatModelRouter {

    private final Map<String, ChatModelProvider> providers;
    private final String activeProvider;

    public DefaultChatModelRouter(
            List<ChatModelProvider> providerList,
            @Value("${ai.chat.provider:openai}") String activeProvider) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toLowerCase().trim(),
                        Function.identity()
                ));
        this.activeProvider = activeProvider.toLowerCase().trim();
    }

    @Override
    public ChatModel getModel() {
        ChatModelProvider provider = providers.get(activeProvider);
        if (provider == null) {
            throw new IllegalArgumentException(
                    "Unsupported chat provider: '" + activeProvider +
                    "'. Supported providers: " + providers.keySet()
            );
        }
        return provider.getChatModel();
    }
}
