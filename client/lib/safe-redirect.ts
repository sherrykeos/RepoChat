/**
 * Validates and sanitizes a post-login redirect path to prevent Open Redirect vulnerabilities.
 * Only internal, relative application paths starting with a single '/' are permitted.
 * Rejects protocol-relative URLs (//), backslash-prefixed paths (/\\), absolute URLs with schemes,
 * control characters, and malformed strings.
 */
export function getSafeRedirectUrl(
  targetUrl: string | null | undefined,
  defaultPath: string = "/dashboard"
): string {
  if (!targetUrl || typeof targetUrl !== "string") {
    return defaultPath;
  }

  const trimmed = targetUrl.trim();
  if (!trimmed) {
    return defaultPath;
  }

  // Reject paths that don't start with '/' or start with '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return defaultPath;
  }

  // Reject CR/LF control characters or tabs that can trick parsers
  if (/[\r\n\t]/.test(trimmed)) {
    return defaultPath;
  }

  try {
    // Resolve against dummy origin to verify origin and scheme integrity
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return defaultPath;
    }

    // Path must start with single '/' and not contain protocol-relative prefixes
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) {
      return defaultPath;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return defaultPath;
  }
}
