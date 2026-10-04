package devPilot.backend.ai.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.ai.chat.model.ChatModel;

class DefaultChatModelRouterTest {

    @Test
    @DisplayName("Should resolve OpenAI when configured")
    void shouldResolveOpenAiWhenConfigured() {
        ChatModel openAiModel = mock(ChatModel.class);
        ChatModel geminiModel = mock(ChatModel.class);

        ChatModelProvider openAiProvider = mock(ChatModelProvider.class);
        when(openAiProvider.getProviderName()).thenReturn("openai");
        when(openAiProvider.getChatModel()).thenReturn(openAiModel);

        ChatModelProvider geminiProvider = mock(ChatModelProvider.class);
        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.getChatModel()).thenReturn(geminiModel);

        DefaultChatModelRouter router = new DefaultChatModelRouter(
                List.of(openAiProvider, geminiProvider), "openai");

        assertThat(router.getModel()).isSameAs(openAiModel);
    }

    @ParameterizedTest
    @ValueSource(strings = {"gemini", "Gemini", "GEMINI"})
    @DisplayName("Should resolve Gemini case-insensitively")
    void shouldResolveGeminiCaseInsensitively(String providerConfig) {
        ChatModel openAiModel = mock(ChatModel.class);
        ChatModel geminiModel = mock(ChatModel.class);

        ChatModelProvider openAiProvider = mock(ChatModelProvider.class);
        when(openAiProvider.getProviderName()).thenReturn("openai");
        when(openAiProvider.getChatModel()).thenReturn(openAiModel);

        ChatModelProvider geminiProvider = mock(ChatModelProvider.class);
        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.getChatModel()).thenReturn(geminiModel);

        DefaultChatModelRouter router = new DefaultChatModelRouter(
                List.of(openAiProvider, geminiProvider), providerConfig);

        assertThat(router.getModel()).isSameAs(geminiModel);
    }

    @Test
    @DisplayName("Should throw meaningful exception when configured chat provider is unsupported")
    void shouldThrowMeaningfulExceptionWhenConfiguredChatProviderIsUnsupported() {
        ChatModelProvider openAiProvider = mock(ChatModelProvider.class);
        when(openAiProvider.getProviderName()).thenReturn("openai");

        ChatModelProvider geminiProvider = mock(ChatModelProvider.class);
        when(geminiProvider.getProviderName()).thenReturn("gemini");

        DefaultChatModelRouter router = new DefaultChatModelRouter(
                List.of(openAiProvider, geminiProvider), "unknown");

        assertThatThrownBy(router::getModel)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported chat provider: 'unknown'")
                .hasMessageContaining("Supported providers:");
    }
}
