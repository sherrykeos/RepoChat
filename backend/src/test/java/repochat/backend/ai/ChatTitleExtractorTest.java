package repochat.backend.ai;

import org.junit.jupiter.api.Test;
import repochat.backend.services.ai.ChatTitleExtractor;

import static org.junit.jupiter.api.Assertions.*;

class ChatTitleExtractorTest {

    @Test
    void testAuthenticationQuestion() {
        String input = "can you explain how the authentication and jwt token validation works in this repo?";
        String title = ChatTitleExtractor.extractTitleEssence(input);
        assertEquals("Authentication and JWT Token Validation", title);
    }

    @Test
    void testBugFixQuestion() {
        String input = "how to fix the memory leak in UserService.java?";
        String title = ChatTitleExtractor.extractTitleEssence(input);
        assertEquals("Fix Memory Leak in UserService.java", title);
    }

    @Test
    void testGreetings() {
        assertEquals("Hello", ChatTitleExtractor.extractTitleEssence("hello"));
        assertEquals("Hello", ChatTitleExtractor.extractTitleEssence("hi there"));
        assertEquals("Hello", ChatTitleExtractor.extractTitleEssence("good morning!"));
    }

    @Test
    void testEmptyAndDefault() {
        assertEquals("New Chat", ChatTitleExtractor.extractTitleEssence(""));
        assertEquals("New Chat", ChatTitleExtractor.extractTitleEssence("   "));
        assertEquals("New Chat", ChatTitleExtractor.extractTitleEssence(null));
        assertTrue(ChatTitleExtractor.isDefaultTitle("New Chat"));
        assertTrue(ChatTitleExtractor.isDefaultTitle("new chat"));
        assertTrue(ChatTitleExtractor.isDefaultTitle("Untitled chat"));
        assertTrue(ChatTitleExtractor.isDefaultTitle("Chat with owner/repo"));
        assertFalse(ChatTitleExtractor.isDefaultTitle("JWT Authentication"));
    }

    @Test
    void testCodeBlockExtraction() {
        String input = "```ts\nconst x = 1;\n```\nwhat does this function do?";
        String title = ChatTitleExtractor.extractTitleEssence(input);
        assertEquals("Function Overview", title);
    }
}
