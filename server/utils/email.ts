/**
 * Normalize an email address: trim whitespace and lowercase the entire string.
 *
 * Email local-parts are technically case-sensitive per RFC 5321, but in
 * practice every major mail provider treats them case-insensitively. We
 * lowercase on input and storage so that lookups are deterministic, account
 * collisions are avoided, and login is forgiving of caps-lock typos.
 */
export function normalizeEmail(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  return trimmed.toLowerCase();
}
