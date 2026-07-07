const { GoogleGenAI } = require("@google/genai");

// Using the same variable name to avoid changing downstream files
const anthropic = new GoogleGenAI({ apiKey: process.env.ANTHROPIC_API_KEY });

// The recommended standard model for general tasks in the free tier
const MODEL = "gemini-2.5-flash";

async function callClaude(systemPrompt, messages, maxTokens = 1024) {
  // 1. Transform the standard message history format to match what Gemini expects.
  // Gemini expects user messages to be under 'user' and assistant responses under 'model'
  const formattedContents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // 2. Execute the model generation call using the standard SDK
  const response = await anthropic.models.generateContent({
    model: MODEL,
    contents: formattedContents,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: maxTokens,
    },
  });

  // 3. Return the generated text string directly
  return response.text;
}

module.exports = { callClaude };
