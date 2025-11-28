import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEmbedding = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    dimensions: 1536,
    input: text,
  });
  return response.data[0].embedding;
};
