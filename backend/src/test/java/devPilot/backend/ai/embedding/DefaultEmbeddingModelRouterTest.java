package devPilot.backend.ai.embedding;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.ai.embedding.EmbeddingModel;

class DefaultEmbeddingModelRouterTest {

    @Test
    @DisplayName("Should resolve OpenAI when configured")
    void shouldResolveOpenAiWhenConfigured() {
        EmbeddingModel openAiModel = mock(EmbeddingModel.class);
        EmbeddingModel geminiModel = mock(EmbeddingModel.class);

        EmbeddingModelProvider openAiProvider = mock(EmbeddingModelProvider.class);
        when(openAiProvider.getProviderName()).thenReturn("openai");
        when(openAiProvider.getEmbeddingModel()).thenReturn(openAiModel);

        EmbeddingModelProvider geminiProvider = mock(EmbeddingModelProvider.class);
        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.getEmbeddingModel()).thenReturn(geminiModel);

        DefaultEmbeddingModelRouter router = new DefaultEmbeddingModelRouter(
                List.of(openAiProvider, geminiProvider), "openai");

        assertThat(router.getModel()).isSameAs(openAiModel);
    }

    @ParameterizedTest
    @ValueSource(strings = {"gemini", "Gemini", "GEMINI"})
    @DisplayName("Should resolve Gemini case-insensitively")
    void shouldResolveGeminiCaseInsensitively(String providerConfig) {
        EmbeddingModel openAiModel = mock(EmbeddingModel.class);
        EmbeddingModel geminiModel = mock(EmbeddingModel.class);

        EmbeddingModelProvider openAiProvider = mock(EmbeddingModelProvider.class);
        when(openAiProvider.getProviderName()).thenReturn("openai");
        when(openAiProvider.getEmbeddingModel()).thenReturn(openAiModel);

        EmbeddingModelProvider geminiProvider = mock(EmbeddingModelProvider.class);
        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.getEmbeddingModel()).thenReturn(geminiModel);

        DefaultEmbeddingModelRouter router = new DefaultEmbeddingModelRouter(
                List.of(openAiProvider, geminiProvider), providerConfig);

        assertThat(router.getModel()).isSameAs(geminiModel);
    }

    @Test
    @DisplayName("Should throw meaningful exception when configured embedding provider is unsupported")
    void shouldThrowMeaningfulExceptionWhenConfiguredEmbeddingProviderIsUnsupported() {
        EmbeddingModelProvider openAiProvider = mock(EmbeddingModelProvider.class);
        when(openAiProvider.getProviderName()).thenReturn("openai");

        EmbeddingModelProvider geminiProvider = mock(EmbeddingModelProvider.class);
        when(geminiProvider.getProviderName()).thenReturn("gemini");

        DefaultEmbeddingModelRouter router = new DefaultEmbeddingModelRouter(
                List.of(openAiProvider, geminiProvider), "unknown");

        assertThatThrownBy(router::getModel)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported embedding provider: 'unknown'")
                .hasMessageContaining("Supported providers:");
    }
}
