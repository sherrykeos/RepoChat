export const DEFAULT_TITLE = "New Chat";

const LOWERCASE_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "for", "nor", "on", "at", "to", "from", "by", "over", "in", "of", "with"
]);

const KNOWN_ACRONYMS: Record<string, string> = {
  jwt: "JWT",
  api: "API",
  apis: "APIs",
  sql: "SQL",
  db: "DB",
  ui: "UI",
  ux: "UX",
  sse: "SSE",
  rag: "RAG",
  llm: "LLM",
  html: "HTML",
  css: "CSS",
  js: "JS",
  ts: "TS",
  http: "HTTP",
  https: "HTTPS",
  rest: "REST",
  dto: "DTO",
  oauth: "OAuth",
  id: "ID",
  ids: "IDs",
  uuid: "UUID",
  sdk: "SDK",
  cli: "CLI",
  aws: "AWS",
  gcp: "GCP",
  ci: "CI",
  cd: "CD",
  pr: "PR",
  url: "URL",
  json: "JSON",
  xml: "XML",
  npm: "NPM",
  git: "Git",
  github: "GitHub",
  chatgpt: "ChatGPT",
};

const DANGLING_WORDS = new Set([
  "and", "or", "to", "for", "in", "of", "the", "a", "an", "with", "by", "on", "at", "from", "via", "as", "is"
]);

export function isDefaultTitle(title?: string | null): boolean {
  if (!title || !title.trim()) return true;
  const t = title.trim();
  return (
    t.toLowerCase() === DEFAULT_TITLE.toLowerCase() ||
    t.toLowerCase() === "untitled chat" ||
    t.toLowerCase().startsWith("chat with ")
  );
}

function hasInternalUppercase(word: string): boolean {
  for (let i = 1; i < word.length; i++) {
    const code = word.charCodeAt(i);
    if (code >= 65 && code <= 90) return true; // A-Z
  }
  return false;
}

export function toTitleCase(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  return words
    .map((w, index) => {
      const lower = w.toLowerCase();
      if (KNOWN_ACRONYMS[lower]) {
        return KNOWN_ACRONYMS[lower];
      }
      if (hasInternalUppercase(w)) {
        return w;
      }
      if (index > 0 && LOWERCASE_WORDS.has(lower)) {
        return lower;
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

export function extractTitleEssence(rawMessage?: string | null): string {
  if (!rawMessage || !rawMessage.trim()) {
    return DEFAULT_TITLE;
  }

  const hadCode = rawMessage.includes("```");

  // 1. Strip markdown code, blockquotes, links, URLs, HTML tags
  let text = rawMessage
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^>.*$/gm, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/<[^>]+>/g, "");

  // Normalize whitespace
  text = text.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();

  if (!text) {
    return hadCode ? "Code Snippet" : DEFAULT_TITLE;
  }

  // Check if message is a simple greeting
  if (/^(hi|hello|hey|greetings|howdy|good\s+(morning|afternoon|evening|day))(\s+there|\s+all|\s+assistant|\s+repochat|\s+bot)?[\s!.,?:;]*$/i.test(text)) {
    return "Hello";
  }

  // 2. Strip conversational prefix fluff iteratively
  let changed = true;
  while (changed) {
    const prev = text;
    text = text.replace(/^(please|kindly|hey|hi|hello)\s*[,:]?\s*/i, "");
    text = text.replace(/^(can|could|would|will)\s+you\s+(please\s+)?(tell\s+me(\s+about)?|explain(\s+to\s+me)?|show\s+me|help\s+me(\s+to|\s+with)?|give\s+me|write|create|implement|describe|generate|find|fix|check|summarize)?\s*/i, "");
    text = text.replace(/^(i\s+want\s+to|i\s+need\s+to|i\s+would\s+like\s+to|i'm\s+trying\s+to|im\s+trying\s+to)\s+(know|understand|find|see|build|fix|write|create)?\s*/i, "");
    text = text.replace(/^(how\s+(to\s+|do\s+i\s+|can\s+i\s+|does\s+|do\s+|would\s+|is\s+|come\s+|the\s+|this\s+|it\s+)?|how\s+)/i, "");
    text = text.replace(/^(what\s+(is\s+(the\s+)?|are\s+(the\s+)?|does\s+(this\s+)?|do\s+|about\s+|this\s+)?|what\s+)/i, "");
    text = text.replace(/^(why\s+(is\s+(the\s+)?|does\s+|do\s+|did\s+)?|why\s+)/i, "");
    text = text.replace(/^(where\s+(is\s+(the\s+)?|are\s+(the\s+)?|can\s+i\s+find\s+|to\s+find\s+)?|where\s+)/i, "");
    text = text.replace(/^(tell\s+me\s+about|explain(\s+to\s+me)?|describe|help\s+me\s+with|help\s+me|show\s+me|give\s+me)\s+/i, "");
    text = text.replace(/^(is\s+there\s+a\s+way\s+to|is\s+it\s+possible\s+to|do\s+you\s+know)\s+/i, "");
    text = text.replace(/^(give\s+me\s+an\s+overview\s+of|overview\s+of)\s+/i, "");
    text = text.replace(/^(let's\s+|lets\s+|let\s+us\s+)/i, "");
    text = text.replace(/^(this|that|these|those)\s+/i, "");
    text = text.replace(/^(the|a|an)\s+/i, "");
    text = text.replace(/^(fix|debug|refactor|test|check|update|implement|add|create|build)\s+(the|a|an)\s+/i, "$1 ");
    text = text.trim();
    changed = text.toLowerCase() !== prev.toLowerCase();
  }

  // 3. Strip conversational suffix fluff
  text = text.replace(/\s+(in\s+this\s+repo(sitory)?|in\s+the\s+repo(sitory)?|in\s+this\s+codebase|in\s+the\s+codebase|in\s+this\s+project|in\s+the\s+project)\s*$/i, "");
  text = text.replace(/\s+(please|thanks|thank\s+you|asap|urgently|for\s+me)\s*$/i, "");
  text = text.replace(/[\s?!.,;:\-_'"`]+$/, "").trim();

  // 4. Transform trailing "works" or "do"
  if (/(\s+works|\s+work)$/i.test(text)) {
    const lastSpace = text.lastIndexOf(" ");
    const without = text.substring(0, lastSpace).trim();
    if (without.split(/\s+/).length >= 2) {
      text = without;
    }
  } else if (/(\s+do|\s+does)$/i.test(text)) {
    const lastSpace = text.lastIndexOf(" ");
    const without = text.substring(0, lastSpace).trim();
    if (without) {
      text = without + " Overview";
    }
  }

  if (!text) {
    return DEFAULT_TITLE;
  }

  // 5. Word selection and length clamping (max 6 words, max ~42 chars)
  const words = text.split(/\s+/).filter(Boolean);
  const selected: string[] = [];
  let currentLen = 0;

  for (let i = 0; i < Math.min(words.length, 6); i++) {
    const word = words[i].replace(/^[^a-zA-Z0-9#+.]+|[^a-zA-Z0-9#+.]+$/g, "");
    if (!word) continue;

    if (selected.length > 0 && currentLen + 1 + word.length > 42) {
      break;
    }
    selected.push(word);
    currentLen += (selected.length > 1 ? 1 : 0) + word.length;
  }

  // Remove trailing dangling connectors
  while (selected.length > 0) {
    const last = selected[selected.length - 1].toLowerCase();
    if (DANGLING_WORDS.has(last)) {
      selected.pop();
    } else {
      break;
    }
  }

  const result = selected.join(" ").trim();
  if (!result || result.length < 2) {
    return DEFAULT_TITLE;
  }

  // 6. Title casing
  return toTitleCase(result);
}
