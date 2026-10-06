package repochat.backend.ai.embedding.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;

class GeminiEmbeddingModelProviderTest {

    @Test
    @DisplayName("Should return provider name and embedding model")
    void shouldReturnProviderNameAndEmbeddingModel() {
        GoogleGenAiTextEmbeddingModel mockModel = mock(GoogleGenAiTextEmbeddingModel.class);
        GeminiEmbeddingModelProvider provider = new GeminiEmbeddingModelProvider(mockModel);

        assertThat(provider.getProviderName()).isEqualTo("gemini");
        assertThat(provider.getEmbeddingModel()).isSameAs(mockModel);
    }
}
