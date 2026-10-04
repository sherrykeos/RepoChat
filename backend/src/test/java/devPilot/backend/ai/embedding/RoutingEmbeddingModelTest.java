package devPilot.backend.ai.embedding;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

class RoutingEmbeddingModelTest {

    @Test
    @DisplayName("Should delegate call(request) to router's model")
    void shouldDelegateCallToRouterModel() {
        EmbeddingModelRouter router = mock(EmbeddingModelRouter.class);
        EmbeddingModel underlyingModel = mock(EmbeddingModel.class);
        EmbeddingRequest request = mock(EmbeddingRequest.class);
        EmbeddingResponse response = mock(EmbeddingResponse.class);

        when(router.getModel()).thenReturn(underlyingModel);
        when(underlyingModel.call(request)).thenReturn(response);

        RoutingEmbeddingModel routingModel = new RoutingEmbeddingModel(router);

        EmbeddingResponse result = routingModel.call(request);

        assertThat(result).isSameAs(response);
        verify(underlyingModel).call(request);
    }

    @Test
    @DisplayName("Should delegate embed(document) to router's model")
    void shouldDelegateEmbedDocument() {
        EmbeddingModelRouter router = mock(EmbeddingModelRouter.class);
        EmbeddingModel underlyingModel = mock(EmbeddingModel.class);
        Document doc = new Document("sample content");
        float[] vector = new float[]{0.1f, 0.2f};

        when(router.getModel()).thenReturn(underlyingModel);
        when(underlyingModel.embed(doc)).thenReturn(vector);

        RoutingEmbeddingModel routingModel = new RoutingEmbeddingModel(router);

        float[] result = routingModel.embed(doc);

        assertThat(result).isEqualTo(vector);
        verify(underlyingModel).embed(doc);
    }

    @Test
    @DisplayName("Should delegate embed(text) to router's model")
    void shouldDelegateEmbedText() {
        EmbeddingModelRouter router = mock(EmbeddingModelRouter.class);
        EmbeddingModel underlyingModel = mock(EmbeddingModel.class);
        float[] vector = new float[]{0.3f, 0.4f};

        when(router.getModel()).thenReturn(underlyingModel);
        when(underlyingModel.embed("hello")).thenReturn(vector);

        RoutingEmbeddingModel routingModel = new RoutingEmbeddingModel(router);

        float[] result = routingModel.embed("hello");

        assertThat(result).isEqualTo(vector);
        verify(underlyingModel).embed("hello");
    }

    @Test
    @DisplayName("Should delegate embed(List<String>) to router's model")
    void shouldDelegateEmbedList() {
        EmbeddingModelRouter router = mock(EmbeddingModelRouter.class);
        EmbeddingModel underlyingModel = mock(EmbeddingModel.class);
        List<float[]> vectors = List.of(new float[]{0.1f}, new float[]{0.2f});

        when(router.getModel()).thenReturn(underlyingModel);
        when(underlyingModel.embed(List.of("a", "b"))).thenReturn(vectors);

        RoutingEmbeddingModel routingModel = new RoutingEmbeddingModel(router);

        List<float[]> result = routingModel.embed(List.of("a", "b"));

        assertThat(result).isEqualTo(vectors);
        verify(underlyingModel).embed(List.of("a", "b"));
    }

    @Test
    @DisplayName("Should delegate dimensions() to router's model")
    void shouldDelegateDimensions() {
        EmbeddingModelRouter router = mock(EmbeddingModelRouter.class);
        EmbeddingModel underlyingModel = mock(EmbeddingModel.class);

        when(router.getModel()).thenReturn(underlyingModel);
        when(underlyingModel.dimensions()).thenReturn(1536);

        RoutingEmbeddingModel routingModel = new RoutingEmbeddingModel(router);

        int dimensions = routingModel.dimensions();

        assertThat(dimensions).isEqualTo(1536);
        verify(underlyingModel).dimensions();
    }
}
