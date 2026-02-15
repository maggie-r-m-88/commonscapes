import fetch from 'node-fetch';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const RATE_LIMIT_MS = 1500;
const MAX_RETRIES = 5;

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function generateTags(image: any, attempt = 1): Promise<string[]> {
  const prompt = `
You are generating discovery tags for a large photo collection.
Rules:
- Output 10–15 tags
- lowercase
- 1–2 words per tag
- no years, no camera/lens/contest names
- no photographer names
- generic but meaningful
- proper nouns allowed: cities, countries

Input:
Title: ${image.title || ''}
Description: ${image.description || ''}
Categories: ${image.categories || ''}

Output:
JSON array of strings only.
`;

  try {
    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const text = await res.text();
      if ((res.status === 429 || res.status === 503) && attempt <= MAX_RETRIES) {
        await sleep(RATE_LIMIT_MS * attempt);
        return generateTags(image, attempt + 1);
      }
      throw new Error(`OpenAI error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as unknown;
    // Safely access the choices/message/content path
    const content =
      typeof data === 'object' && data !== null && Array.isArray((data as any).choices)
        ? (data as any).choices?.[0]?.message?.content
        : undefined;

    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI response missing content');
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      // If the assistant returned non-JSON, attempt to extract JSON substring
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e2) {
          throw new Error('Failed to parse JSON from OpenAI content');
        }
      }
      throw new Error('Unexpected OpenAI content format');
    }
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      await sleep(RATE_LIMIT_MS * attempt);
      return generateTags(image, attempt + 1);
    }
    throw err;
  }
}
