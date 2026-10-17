package repochat.backend.services.ai;

import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

public final class ChatTitleExtractor {

    private ChatTitleExtractor() {
    }

    private static final String DEFAULT_TITLE = "New Chat";

    private static final Set<String> LOWERCASE_WORDS = Set.of(
            "a", "an", "the", "and", "or", "but", "for", "nor", "on", "at", "to", "from", "by", "over", "in", "of", "with"
    );

    private static final Map<String, String> KNOWN_ACRONYMS = Map.ofEntries(
            Map.entry("jwt", "JWT"),
            Map.entry("api", "API"),
            Map.entry("apis", "APIs"),
            Map.entry("sql", "SQL"),
            Map.entry("db", "DB"),
            Map.entry("ui", "UI"),
            Map.entry("ux", "UX"),
            Map.entry("sse", "SSE"),
            Map.entry("rag", "RAG"),
            Map.entry("llm", "LLM"),
            Map.entry("html", "HTML"),
            Map.entry("css", "CSS"),
            Map.entry("js", "JS"),
            Map.entry("ts", "TS"),
            Map.entry("http", "HTTP"),
            Map.entry("https", "HTTPS"),
            Map.entry("rest", "REST"),
            Map.entry("dto", "DTO"),
            Map.entry("oauth", "OAuth"),
            Map.entry("id", "ID"),
            Map.entry("ids", "IDs"),
            Map.entry("uuid", "UUID"),
            Map.entry("sdk", "SDK"),
            Map.entry("cli", "CLI"),
            Map.entry("aws", "AWS"),
            Map.entry("gcp", "GCP"),
            Map.entry("ci", "CI"),
            Map.entry("cd", "CD"),
            Map.entry("pr", "PR"),
            Map.entry("url", "URL"),
            Map.entry("json", "JSON"),
            Map.entry("xml", "XML"),
            Map.entry("npm", "NPM"),
            Map.entry("git", "Git"),
            Map.entry("github", "GitHub"),
            Map.entry("chatgpt", "ChatGPT")
    );

    private static final Set<String> DANGLING_WORDS = Set.of(
            "and", "or", "to", "for", "in", "of", "the", "a", "an", "with", "by", "on", "at", "from", "via", "as", "is"
    );

    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile("(?s)```.*?```");
    private static final Pattern BLOCKQUOTE_PATTERN = Pattern.compile("(?m)^>.*$");
    private static final Pattern INLINE_CODE_PATTERN = Pattern.compile("`([^`]+)`");
    private static final Pattern MARKDOWN_LINK_PATTERN = Pattern.compile("\\[([^\\]]+)\\]\\([^)]+\\)");
    private static final Pattern URL_PATTERN = Pattern.compile("https?://\\S+");
    private static final Pattern HTML_PATTERN = Pattern.compile("<[^>]+>");

    public static boolean isDefaultTitle(String title) {
        if (title == null || title.isBlank()) {
            return true;
        }
        String t = title.trim();
        return t.equalsIgnoreCase(DEFAULT_TITLE)
                || t.equalsIgnoreCase("Untitled chat")
                || t.toLowerCase().startsWith("chat with ");
    }

    public static String extractTitleEssence(String rawMessage) {
        if (rawMessage == null || rawMessage.isBlank()) {
            return DEFAULT_TITLE;
        }

        boolean hadCode = rawMessage.contains("```");

        // 1. Remove markdown syntax, code, blockquotes, links, urls
        String text = CODE_BLOCK_PATTERN.matcher(rawMessage).replaceAll(" ");
        text = BLOCKQUOTE_PATTERN.matcher(text).replaceAll(" ");
        text = INLINE_CODE_PATTERN.matcher(text).replaceAll("$1");
        text = MARKDOWN_LINK_PATTERN.matcher(text).replaceAll("$1");
        text = URL_PATTERN.matcher(text).replaceAll("");
        text = HTML_PATTERN.matcher(text).replaceAll("");

        // Normalize whitespace
        text = text.replaceAll("[\\r\\n\\t]+", " ").replaceAll("\\s+", " ").trim();

        if (text.isBlank()) {
            return hadCode ? "Code Snippet" : DEFAULT_TITLE;
        }

        // Check if message is a simple greeting
        if (text.matches("(?i)^(hi|hello|hey|greetings|howdy|good\\s+(morning|afternoon|evening|day))(\\s+there|\\s+all|\\s+assistant|\\s+repochat|\\s+bot)?([\\s!.,?:;]*)$")) {
            return "Hello";
        }

        // 2. Strip conversational prefix fluff iteratively
        boolean changed = true;
        while (changed) {
            String prev = text;
            text = text.replaceAll("(?i)^(please|kindly|hey|hi|hello)\\s*[,:]?\\s*", "");
            text = text.replaceAll("(?i)^(can|could|would|will)\\s+you\\s+(please\\s+)?(tell\\s+me(\\s+about)?|explain(\\s+to\\s+me)?|show\\s+me|help\\s+me(\\s+to|\\s+with)?|give\\s+me|write|create|implement|describe|generate|find|fix|check|summarize)?\\s*", "");
            text = text.replaceAll("(?i)^(i\\s+want\\s+to|i\\s+need\\s+to|i\\s+would\\s+like\\s+to|i'm\\s+trying\\s+to|im\\s+trying\\s+to)\\s+(know|understand|find|see|build|fix|write|create)?\\s*", "");
            text = text.replaceAll("(?i)^(how\\s+(to\\s+|do\\s+i\\s+|can\\s+i\\s+|does\\s+|do\\s+|would\\s+|is\\s+|come\\s+|the\\s+|this\\s+|it\\s+)?|how\\s+)", "");
            text = text.replaceAll("(?i)^(what\\s+(is\\s+(the\\s+)?|are\\s+(the\\s+)?|does\\s+(this\\s+)?|do\\s+|about\\s+|this\\s+)?|what\\s+)", "");
            text = text.replaceAll("(?i)^(why\\s+(is\\s+(the\\s+)?|does\\s+|do\\s+|did\\s+)?|why\\s+)", "");
            text = text.replaceAll("(?i)^(where\\s+(is\\s+(the\\s+)?|are\\s+(the\\s+)?|can\\s+i\\s+find\\s+|to\\s+find\\s+)?|where\\s+)", "");
            text = text.replaceAll("(?i)^(tell\\s+me\\s+about|explain(\\s+to\\s+me)?|describe|help\\s+me\\s+with|help\\s+me|show\\s+me|give\\s+me)\\s+", "");
            text = text.replaceAll("(?i)^(is\\s+there\\s+a\\s+way\\s+to|is\\s+it\\s+possible\\s+to|do\\s+you\\s+know)\\s+", "");
            text = text.replaceAll("(?i)^(give\\s+me\\s+an\\s+overview\\s+of|overview\\s+of)\\s+", "");
            text = text.replaceAll("(?i)^(let's\\s+|lets\\s+|let\\s+us\\s+)", "");
            text = text.replaceAll("(?i)^(this|that|these|those)\\s+", "");
            text = text.replaceAll("(?i)^(the|a|an)\\s+", "");
            text = text.replaceAll("(?i)^(fix|debug|refactor|test|check|update|implement|add|create|build)\\s+(the|a|an)\\s+", "$1 ");
            text = text.trim();
            changed = !text.equalsIgnoreCase(prev);
        }

        // 3. Strip conversational suffix fluff
        text = text.replaceAll("(?i)\\s+(in\\s+this\\s+repo(sitory)?|in\\s+the\\s+repo(sitory)?|in\\s+this\\s+codebase|in\\s+the\\s+codebase|in\\s+this\\s+project|in\\s+the\\s+project)\\s*$", "");
        text = text.replaceAll("(?i)\\s+(please|thanks|thank\\s+you|asap|urgently|for\\s+me)\\s*$", "");
        text = text.replaceAll("[\\s?!.,;:\\-_'\"`]+$", "").trim();

        // 4. Transform trailing "works" or "do"
        if (text.toLowerCase().endsWith(" works") || text.toLowerCase().endsWith(" work")) {
            int lastSpace = text.lastIndexOf(' ');
            String without = text.substring(0, lastSpace).trim();
            if (without.split("\\s+").length >= 2) {
                text = without;
            }
        } else if (text.toLowerCase().endsWith(" do") || text.toLowerCase().endsWith(" does")) {
            int lastSpace = text.lastIndexOf(' ');
            String without = text.substring(0, lastSpace).trim();
            if (!without.isBlank()) {
                text = without + " Overview";
            }
        }

        if (text.isBlank()) {
            return DEFAULT_TITLE;
        }

        // 5. Word selection and length clamping (max 6 words, max ~42 chars)
        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < Math.min(words.length, 6); i++) {
            String word = words[i].replaceAll("^[^a-zA-Z0-9#+.]+|[^a-zA-Z0-9#+.]+$", "");
            if (word.isBlank()) continue;

            if (sb.length() > 0 && sb.length() + 1 + word.length() > 42) {
                break;
            }
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(word);
        }

        String result = sb.toString().trim();

        // Remove trailing dangling connectors
        while (true) {
            int lastSpace = result.lastIndexOf(' ');
            if (lastSpace == -1) break;
            String lastWord = result.substring(lastSpace + 1).toLowerCase();
            if (DANGLING_WORDS.contains(lastWord)) {
                result = result.substring(0, lastSpace).trim();
            } else {
                break;
            }
        }

        if (result.isBlank() || result.length() < 2) {
            return DEFAULT_TITLE;
        }

        // 6. Title casing and acronym formatting
        return toTitleCase(result);
    }

    public static String toTitleCase(String text) {
        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < words.length; i++) {
            String w = words[i];
            String lower = w.toLowerCase();

            if (i > 0) {
                sb.append(" ");
            }

            if (KNOWN_ACRONYMS.containsKey(lower)) {
                sb.append(KNOWN_ACRONYMS.get(lower));
            } else if (hasInternalUppercase(w)) {
                // Preserve existing camelCase or PascalCase like UserService or ChatService
                sb.append(w);
            } else if (i > 0 && LOWERCASE_WORDS.contains(lower)) {
                sb.append(lower);
            } else {
                // Capitalize first character
                sb.append(Character.toUpperCase(w.charAt(0)));
                if (w.length() > 1) {
                    sb.append(w.substring(1).toLowerCase());
                }
            }
        }

        return sb.toString();
    }

    private static boolean hasInternalUppercase(String word) {
        for (int i = 1; i < word.length(); i++) {
            if (Character.isUpperCase(word.charAt(i))) {
                return true;
            }
        }
        return false;
    }
}
