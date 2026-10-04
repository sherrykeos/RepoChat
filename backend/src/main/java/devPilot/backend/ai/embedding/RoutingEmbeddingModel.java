package devPilot.backend.ai.embedding;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

import lombok.RequiredArgsConstructor;

/**
 * Spring AI {@link EmbeddingModel} delegate that dynamically delegates all calls
 * to the {@link EmbeddingModel} resolved by the {@link EmbeddingModelRouter}.
 *
 * <p>This allows Spring AI components such as {@code PgVectorStore} to use the
 * dynamically routed embedding model transparently.
 */
@RequiredArgsConstructor
public class RoutingEmbeddingModel implements EmbeddingModel {

    private final EmbeddingModelRouter router;

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        return router.getModel().call(request);
    }

    @Override
    public float[] embed(Document document) {
        return router.getModel().embed(document);
    }

    @Override
    public float[] embed(String text) {
        return router.getModel().embed(text);
    }

    @Override
    public List<float[]> embed(List<String> texts) {
        return router.getModel().embed(texts);
    }

    @Override
    public int dimensions() {
        return router.getModel().dimensions();
    }
}
