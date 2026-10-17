package repochat.backend.services.indexing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;

import repochat.backend.entity.IndexStatus;
import repochat.backend.entity.Repository;
import repochat.backend.exceptions.NotFoundException;
import repochat.backend.repository.RepositoryRepository;
import repochat.backend.services.UserService;
import repochat.backend.services.ai.RagSettings;
import repochat.backend.services.github.GitHubRateLimiter;
import repochat.backend.services.github.GithubApiClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexingService {
    private static final int VECTOR_BATCH_SIZE = 32;
    private static final int PROGRESS_EVERY_N_FILES = 5;

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;
    private final CodeFileFilter fileFilter;
    private final CodeChunker codeChunker;
    private final GitHubRateLimiter rateLimiter;
    private final VectorStore vectorStore;
    private Set<UUID> cancelledIndexing = ConcurrentHashMap.newKeySet();

    @Value("${app.indexing.max-file-bytes:102400}")
    private long maxFileBytes;

    public Repository startIndexing(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        cancelledIndexing.remove(repoId);

        repo.setIndexStatus(IndexStatus.INDEXING);
        repo.setFilesProcessed(0);
        repo.setFilesTotal(0);
        repo.setChunkCount(0);
        repo.setErrorMessage(null);
        repo.setUpdatedAt(Instant.now());
        return repositoryRepository.save(repo);
    }

    @Transactional
    public Repository stopIndexing(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        cancelledIndexing.add(repoId);
        deleteExistingVectors(repoId.toString());

        repo.setIndexStatus(IndexStatus.PENDING);
        repo.setFilesTotal(0);
        repo.setFilesProcessed(0);
        repo.setChunkCount(0);
        repo.setIndexedAt(null);
        repo.setErrorMessage(null);
        repo.setUpdatedAt(Instant.now());
        Repository saved = repositoryRepository.save(repo);
        log.info("Stopped indexing for repository {} ({})", repo.getFullName(), repoId);
        return saved;
    }

    @Transactional
    public Repository unindex(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        cancelledIndexing.add(repoId);
        deleteExistingVectors(repoId.toString());

        repo.setIndexStatus(IndexStatus.PENDING);
        repo.setFilesTotal(0);
        repo.setFilesProcessed(0);
        repo.setChunkCount(0);
        repo.setIndexedAt(null);
        repo.setErrorMessage(null);
        repo.setUpdatedAt(Instant.now());
        return repositoryRepository.save(repo);
    }

    @Async("indexingExecutor")
    public void indexAsync(UUID repoId, UUID userId) {
        try {
            doIndex(repoId, userId);
        } catch (Exception ex) {
            if (isCancelled(repoId)) {
                handleCancellation(repoId);
                return;
            }
            log.error("Indexing failed for repo {}", repoId, ex);
            markFailed(repoId, ex.getMessage());
        } finally {
            cancelledIndexing.remove(repoId);
        }
    }

    private void doIndex(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));
        String token = userService.decryptAccessToken(userService.requiredById(userId));

        deleteExistingVectors(repoId.toString());

        if (isCancelled(repoId)) {
            handleCancellation(repoId);
            return;
        }

        Map<String, Object> tree = gitHubApiClient.getRepoTree(
                token, repo.getOwner(), repo.getName(), repo.getDefaultBranch());
        List<String> filePaths = listIndexableFiles(tree);

        if (isCancelled(repoId)) {
            handleCancellation(repoId);
            return;
        }

        updateProgress(repoId, filePaths.size(), 0, 0, IndexStatus.INDEXING, null);

        List<Document> batch = new ArrayList<>();
        int processed = 0;
        int totalChunks = 0;

        for (String path : filePaths) {
            if (isCancelled(repoId)) {
                handleCancellation(repoId);
                return;
            }

            try {
                String content = gitHubApiClient.getFileContent(
                        token, repo.getOwner(), repo.getName(), path);
                List<Document> chunks = codeChunker.chunkFile(repoId.toString(), path, content);
                batch.addAll(chunks);
                totalChunks += chunks.size();
                if (batch.size() >= VECTOR_BATCH_SIZE) {
                    vectorStore.add(batch);
                    batch.clear();
                }
            } catch (Exception ex) {
                log.warn("Skipping file {} in {}: {}", path, repo.getFullName(), ex.getMessage());
            }

            processed++;
            if (processed % PROGRESS_EVERY_N_FILES == 0 || processed == filePaths.size()) {
                updateProgress(repoId, filePaths.size(), processed, totalChunks, IndexStatus.INDEXING, null);
            }
            rateLimiter.pause();
        }

        if (isCancelled(repoId)) {
            handleCancellation(repoId);
            return;
        }

        if (!batch.isEmpty()) {
            vectorStore.add(batch);
        }

        markReady(repoId, filePaths.size(), processed, totalChunks, repo.getFullName());
    }

    private boolean isCancelled(UUID repoId) {
        return cancelledIndexing.contains(repoId) || Thread.currentThread().isInterrupted();
    }

    private void handleCancellation(UUID repoId) {
        log.info("Indexing stopped by user for repo {}", repoId);
        cancelledIndexing.remove(repoId);
        deleteExistingVectors(repoId.toString());
        updateProgress(repoId, 0, 0, 0, IndexStatus.PENDING, null);
    }


       @SuppressWarnings("unchecked")
    private List<String> listIndexableFiles(Map<String, Object> tree) {
        if (tree == null || tree.get("tree") == null) {
            return List.of();
        }

        List<Map<String, Object>> entries = (List<Map<String, Object>>) tree.get("tree");
        return entries.stream()
                .filter(entry -> "blob".equals(String.valueOf(entry.get("type"))))
                .filter(entry -> {
                    String path = String.valueOf(entry.get("path"));
                    long size = entry.get("size") instanceof Number n ? n.longValue() : 0L;
                    return fileFilter.isEligible(path, size, maxFileBytes);
                })
                .map(entry -> String.valueOf(entry.get("path")))
                .toList();
    }

     private void deleteExistingVectors(String repoId) {
        try {
            var filter = new FilterExpressionBuilder().eq(RagSettings.METADATA_REPO_ID, repoId).build();
            vectorStore.delete(filter);
        } catch (Exception ex) {
            log.warn("Could not delete existing vectors for repo {}: {}", repoId, ex.getMessage());
        }
    }

      @Transactional
    protected void updateProgress(
            UUID repoId,
            int total,
            int processed,
            int chunks,
            IndexStatus status,
            String error) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setFilesTotal(total);
            repo.setFilesProcessed(processed);
            repo.setChunkCount(chunks);
            repo.setIndexStatus(status);
            repo.setErrorMessage(error);
            repo.setUpdatedAt(Instant.now());
            repositoryRepository.save(repo);
        });
    }

      @Transactional
    protected void markReady(UUID repoId, int totalFiles, int processedFiles, int totalChunks, String fullName) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.READY);
            repo.setFilesTotal(totalFiles);
            repo.setFilesProcessed(processedFiles);
            repo.setChunkCount(totalChunks);
            repo.setIndexedAt(Instant.now());
            repo.setErrorMessage(null);
            repo.setUpdatedAt(Instant.now());
            repositoryRepository.save(repo);
        });
        log.info("Indexed {} files ({} chunks) for {}", processedFiles, totalChunks, fullName);
    }

     @Transactional
    protected void markFailed(UUID repoId, String message) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.FAILED);
            repo.setErrorMessage(message != null && message.length() > 2000
                    ? message.substring(0, 2000)
                    : message);
            repo.setUpdatedAt(Instant.now());
            repositoryRepository.save(repo);
        });
    }

}