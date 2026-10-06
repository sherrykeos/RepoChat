# AI Provider Architecture

RepoChat uses a decoupled, provider-independent model routing architecture for all AI operations.

## Core Design Principles

1. **Independent Routers**:
   - `ChatModelRouter`: Responsible solely for chat, reasoning, and text generation.
   - `EmbeddingModelRouter`: Responsible solely for vector embeddings and document indexing.
   - Chat and Embedding providers are completely decoupled (e.g. Chat can use Gemini while Embeddings use OpenAI, or both can use Gemini).

2. **Clean Dependency Injection**:
   - Application services (such as `ChatStreamHandler`, `IndexingService`, and `CodeContextRetriever`) do not directly reference provider-specific classes (e.g. `OpenAiChatModel`, `GoogleGenAiChatModel`, `OpenAiEmbeddingModel`, `GoogleGenAiTextEmbeddingModel`).
   - `RoutingEmbeddingModel` acts as a `@Primary` `EmbeddingModel` delegate in Spring context so that `PgVectorStore` transparently uses the active embedding model selected by `EmbeddingModelRouter`.

---

## Configuration Properties

### Provider Selection
```properties
# Active chat provider (supported: openai, gemini)
ai.chat.provider=openai

# Active embedding provider (supported: openai, gemini)
ai.embedding.provider=openai
```

### Provider-Specific Credentials & Options

#### OpenAI Provider Settings
```properties
ai.openai.api-key=${OPENAI_API_KEY:dummy-key-for-dev}
ai.openai.chat.model=gpt-4o-mini
ai.openai.embedding.model=text-embedding-3-small
```

#### Google Gemini Provider Settings
```properties
ai.gemini.api-key=${GEMINI_API_KEY:${GOOGLE_API_KEY:dummy-key-for-dev}}
ai.gemini.chat.model=gemini-2.5-flash
ai.gemini.embedding.model=gemini-embedding-001
```

---

## Active Registered Providers

### Chat Providers (`ChatModelRouter`)
- **`openai`**: Backed by `OpenAiChatModelProvider` (`OpenAiChatModel`)
- **`gemini`**: Backed by `GeminiChatModelProvider` (`GoogleGenAiChatModel`)

### Embedding Providers (`EmbeddingModelRouter`)
- **`openai`**: Backed by `OpenAiEmbeddingModelProvider` (`OpenAiEmbeddingModel`, 1536 dimensions)
- **`gemini`**: Backed by `GeminiEmbeddingModelProvider` (`GoogleGenAiTextEmbeddingModel`, 3072 dimensions)

---

## PGVector Dimensions & Switching Providers

> [!IMPORTANT]
> **Embedding Spaces & Dimensions**:
> - OpenAI `text-embedding-3-small` produces **1536-dimensional** vectors.
> - Google Gemini `gemini-embedding-001` produces **3072-dimensional** vectors.
> - PGVector stores vectors in a typed column (e.g., `vector(1536)` or `vector(3072)`).
> - Vectors from different providers occupy incompatible semantic spaces and cannot be mixed or reused.
> - When switching `ai.embedding.provider` between `openai` and `gemini`, the `vector_store` table should be recreated (`DROP TABLE IF EXISTS vector_store;`) and repositories re-indexed (`POST /api/repos/{id}/index`).
