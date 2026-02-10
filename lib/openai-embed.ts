import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const RATE_LIMIT_MS = 1500;
const MAX_RETRIES = 5;

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function generateEmbedding(text: string, attempt = 1): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text
    });
    return response.data[0].embedding.map(Number);
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      await sleep(RATE_LIMIT_MS * attempt);
      return generateEmbedding(text, attempt + 1);
    }
    throw err;
  }
}
