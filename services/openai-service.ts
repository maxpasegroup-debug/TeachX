import OpenAI from "openai";

const defaultModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function runOpenAICompletion(input: { system: string; prompt: string; model?: string }) {
  const openai = getOpenAIClient();
  if (!openai) {
    return {
      model: input.model ?? defaultModel,
      text: "AI is ready. Add OPENAI_API_KEY to enable live responses.",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }

  const response = await openai.responses.create({
    model: input.model ?? defaultModel,
    input: [
      { role: "system", content: input.system },
      { role: "user", content: input.prompt }
    ]
  });

  return {
    model: input.model ?? defaultModel,
    text: response.output_text,
    usage: {
      promptTokens: response.usage?.input_tokens ?? 0,
      completionTokens: response.usage?.output_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0
    }
  };
}
