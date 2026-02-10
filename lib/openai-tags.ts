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

    const json = await res.json();
    return JSON.parse(json.choices[0].message.content);
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      await sleep(RATE_LIMIT_MS * attempt);
      return generateTags(image, attempt + 1);
    }
    throw err;
  }
}
