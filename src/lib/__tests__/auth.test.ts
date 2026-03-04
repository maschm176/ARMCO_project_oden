// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ set: mockSet }),
}));

const { createSession } = await import("@/lib/auth");

beforeEach(() => {
  mockSet.mockClear();
  vi.unstubAllEnvs();
});

test("sets an auth-token cookie", async () => {
  await createSession("user-1", "user@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  expect(mockSet.mock.calls[0][0]).toBe("auth-token");
});

test("cookie contains a valid JWT with userId and email", async () => {
  await createSession("user-1", "user@example.com");

  const token = mockSet.mock.calls[0][1] as string;
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "development-secret-key"
  );
  const { payload } = await jwtVerify(token, secret);

  expect(payload.userId).toBe("user-1");
  expect(payload.email).toBe("user@example.com");
});

test("cookie expires in approximately 7 days", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const options = mockSet.mock.calls[0][2] as { expires: Date };
  const expiresMs = options.expires.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDaysMs);
  expect(expiresMs).toBeLessThanOrEqual(after + sevenDaysMs);
});

test("cookie is set with httpOnly, sameSite lax, and path /", async () => {
  await createSession("user-1", "user@example.com");

  const options = mockSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("cookie is not secure outside production", async () => {
  vi.stubEnv("NODE_ENV", "test");
  await createSession("user-1", "user@example.com");

  const options = mockSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.secure).toBe(false);
});

test("cookie is secure in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await createSession("user-1", "user@example.com");

  const options = mockSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.secure).toBe(true);
});
