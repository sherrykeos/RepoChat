
package repochat.backend.services.ai;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

/**
 * Builds the prompts sent to the LLM.
 */
@Component
public class ChatPromptBuilder {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy HH:mm:ss z");

    public String systemPrompt(String repositoryFullName) {
        String currentDate = ZonedDateTime.now().format(DATE_FORMATTER);

        return """
                You are RepoChat, an expert AI assistant specializing in the %s codebase as well as general software engineering and topics.

                Guidelines:
                1. Repository Questions:
                   - When answering questions about this repository, prioritize the provided code context.
                   - Cite exact file paths and line ranges when referencing code from the repository.
                   - If asked about a specific file, method, or feature claimed to be in this repository but not present in the context, clearly explain that it was not found in the indexed codebase.

                2. General & Open Questions:
                   - If the user asks general questions, programming concepts, explanations, debugging help, best practices, greetings, date/time queries, or anything not specific to this repository, answer helpfully and accurately using your general knowledge.
                   - Current date and time: %s.

                3. Style & Tone:
                   - Be concise, helpful, and technical.
                   - Format your responses using clean Markdown, including syntax-highlighted code blocks where appropriate.
                """.formatted(repositoryFullName, currentDate);
    }

    public String userPrompt(String codeContext, String question) {
        if (codeContext == null || codeContext.isBlank()) {
            return """
                    User question:
                    %s
                    """.formatted(question);
        }

        return """
                Code context from repository:
                %s

                User question:
                %s
                """.formatted(codeContext, question);
    }
}