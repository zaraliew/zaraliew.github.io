export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });

  const { lines } = req.body;
  if (!lines?.length) return res.status(400).json({ error: 'Missing lines' });

  // Detect language
  const sample = lines.join('');
  const isKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(sample);
  const isChinese = /[\u4e00-\u9fff]/.test(sample);

  const langInstructions = isKorean
    ? `These are Korean lyrics. Add romanization (McCune-Reischauer or Revised Romanization) and natural English translation. Use "pinyin" field for romanization.`
    : `These are Mandarin Chinese lyrics. Add pinyin with tone marks and natural English translation.`;

  const numbered = lines.map((l, i) => `${i+1}. ${l}`).join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: 'You are a Mandarin annotation tool. You output ONLY valid JSON — no markdown, no backticks, no explanation, nothing else.',
        messages: [
          {
            role: 'user',
            content: `${langInstructions}\n\n${numbered}\n\nReturn a JSON array, one object per line:\n[{"line":1,"characters":"你好","pinyin":"nǐ hǎo","english":"hello","words":[{"char":"你","pinyin":"nǐ","english":"you"},{"char":"好","pinyin":"hǎo","english":"good"}]}]\n\nRules: tone marks always required for Mandarin, convert any traditional Chinese characters to simplified Chinese in all fields, group natural word units, keep English poetic for song lyrics.`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || `Anthropic API error ${response.status}` });
    }

    const data = await response.json();
    let raw = data.content?.[0]?.text || '';
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    let result;
    try { result = JSON.parse(raw); }
    catch { try { result = JSON.parse(raw + ']'); } catch { return res.status(500).json({ error: 'Failed to parse response' }); } }

    return res.json({ result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
