import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getApiBaseUrl } from "./api.ts";

describe("getApiBaseUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    }
  });

  it("prioritizes NEXT_PUBLIC_API_BASE_URL when configured", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://repochat-api.onrender.com";
    assert.equal(getApiBaseUrl(), "https://repochat-api.onrender.com");
  });

  it("normalizes and strips trailing slashes from NEXT_PUBLIC_API_BASE_URL", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://repochat-api.onrender.com///";
    assert.equal(getApiBaseUrl(), "https://repochat-api.onrender.com");
  });

  it("falls back to localhost:8080 when NEXT_PUBLIC_API_BASE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    assert.equal(getApiBaseUrl(), "http://localhost:8080");
  });

  it("handles whitespace in environment variable gracefully", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "   https://api.example.com/  ";
    assert.equal(getApiBaseUrl(), "https://api.example.com");
  });
});
