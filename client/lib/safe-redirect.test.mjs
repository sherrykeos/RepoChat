import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSafeRedirectUrl } from "./safe-redirect.ts";

describe("getSafeRedirectUrl", () => {
  it("accepts valid internal application paths", () => {
    assert.equal(getSafeRedirectUrl("/dashboard"), "/dashboard");
    assert.equal(getSafeRedirectUrl("/dashboard/repositories"), "/dashboard/repositories");
    assert.equal(getSafeRedirectUrl("/dashboard/repo/12345"), "/dashboard/repo/12345");
    assert.equal(getSafeRedirectUrl("/chat/abc-xyz?tab=code"), "/chat/abc-xyz?tab=code");
  });

  it("rejects protocol-relative URLs", () => {
    assert.equal(getSafeRedirectUrl("//attacker.com"), "/dashboard");
    assert.equal(getSafeRedirectUrl("//attacker.com/evil"), "/dashboard");
    assert.equal(getSafeRedirectUrl("///attacker.com"), "/dashboard");
  });

  it("rejects backslash-based URL ambiguities", () => {
    assert.equal(getSafeRedirectUrl("/\\attacker.com"), "/dashboard");
    assert.equal(getSafeRedirectUrl("/\\/attacker.com"), "/dashboard");
    assert.equal(getSafeRedirectUrl("\\attacker.com"), "/dashboard");
  });

  it("rejects absolute external URLs", () => {
    assert.equal(getSafeRedirectUrl("https://attacker.com"), "/dashboard");
    assert.equal(getSafeRedirectUrl("http://attacker.com/login"), "/dashboard");
    assert.equal(getSafeRedirectUrl("javascript:alert(1)"), "/dashboard");
    assert.equal(getSafeRedirectUrl("data:text/html,evil"), "/dashboard");
  });

  it("safely falls back to default on invalid or empty values", () => {
    assert.equal(getSafeRedirectUrl(""), "/dashboard");
    assert.equal(getSafeRedirectUrl(null), "/dashboard");
    assert.equal(getSafeRedirectUrl(undefined), "/dashboard");
    assert.equal(getSafeRedirectUrl("   "), "/dashboard");
    assert.equal(getSafeRedirectUrl("/invalid\nnewline"), "/dashboard");
  });

  it("supports custom fallback paths", () => {
    assert.equal(getSafeRedirectUrl("//evil.com", "/home"), "/home");
    assert.equal(getSafeRedirectUrl(null, "/login"), "/login");
  });
});
