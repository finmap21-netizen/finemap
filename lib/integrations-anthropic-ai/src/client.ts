import Anthropic from "@anthropic-ai/sdk";

if (!process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) {
  console.warn(
    "AI_INTEGRATIONS_ANTHROPIC_BASE_URL is not set. Anthropic AI features will be disabled.",
  );
}

if (!process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
  console.warn(
    "AI_INTEGRATIONS_ANTHROPIC_API_KEY is not set. Anthropic AI features will be disabled.",
  );
}

export const anthropic = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY && process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL 
  ? new Anthropic({
      apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
    })
  : null;
