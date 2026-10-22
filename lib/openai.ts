import OpenAI from "openai";

export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return new OpenAI({
    apiKey,
  });
};

export const getOpenAIModel = (): string => {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
};

/**
 * Redacts secrets, tokens, and passwords from logs before sending to LLM.
 */
export function sanitizeLogs(logs: string, maxLength: number = 16000): string {
  if (!logs) return "";

  let sanitized = logs
    // Specific tokens first
    .replace(/sk-[a-zA-Z0-9_\-]{20,}/gi, "[REDACTED_OPENAI_KEY]")
    .replace(/gh[pousr]_[a-zA-Z0-9]{36,}/gi, "[REDACTED_GITHUB_TOKEN]")
    // Generic bearer / token / key secrets
    .replace(/(?:Bearer\s+|token\s+|key[:=]\s*)[a-zA-Z0-9_\-\.]{15,}/gi, "[REDACTED_SECRET]")
    .replace(/postgres(?:ql)?:\/\/[^:]+:[^@]+@/gi, "postgresql://user:***@");

  if (sanitized.length > maxLength) {
    const half = Math.floor(maxLength / 2);
    sanitized = `${sanitized.slice(0, half)}\n\n... [TRUNCATED ${sanitized.length - maxLength} CHARS FOR SAFETY & TOKEN LIMITS] ...\n\n${sanitized.slice(-half)}`;
  }

  return sanitized;
}
