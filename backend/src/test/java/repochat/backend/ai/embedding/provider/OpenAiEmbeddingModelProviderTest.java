package repochat.backend.ai.embedding.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.openai.OpenAiEmbeddingModel;

class OpenAiEmbeddingModelProviderTest {

    @Test
    @DisplayName("Should return provider name and embedding model")
    void shouldReturnProviderNameAndEmbeddingModel() {
        OpenAiEmbeddingModel mockModel = mock(OpenAiEmbeddingModel.class);
        OpenAiEmbeddingModelProvider provider = new OpenAiEmbeddingModelProvider(mockModel);

        assertThat(provider.getProviderName()).isEqualTo("openai");
        assertThat(provider.getEmbeddingModel()).isSameAs(mockModel);
    }
}
