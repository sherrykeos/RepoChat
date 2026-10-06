package repochat.backend.services.ai;

import java.util.List;

import repochat.backend.dto.CitationDto;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText) {
}