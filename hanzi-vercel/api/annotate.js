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
        max_tokens: 4000,
        system: 'You output ONLY a raw JSON array. No markdown, no backticks, no explanation. Start immediately with [',
        messages: [
          {
            role: 'user',
            content: `Annotate these Mandarin song lyric lines with pinyin (tone marks required) and natural English translation.\n\n${numbered}\n\nReturn a JSON array, one object per line:\n[{"line":1,"characters":"你好","pinyin":"nǐ hǎo","english":"hello","words":[{"char":"你","pinyin":"nǐ","english":"you"},{"char":"好","pinyin":"hǎo","english":"good"}]}]\n\nRules: tone marks always required, group natural word units, keep English poetic for song lyrics.`
          },
          { role: 'assistant', content: '[' }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || `Anthropic API error ${response.status}` });
    }

    const data = await response.json();
    const raw = '[' + (data.content?.[0]?.text || '');

    let result;
    try { result = JSON.parse(raw); }
    catch { 
      try { result = JSON.parse(raw + ']'); }
      catch { return res.status(500).json({ error: 'Failed to parse Claude response' }); }
    }

    return res.json({ result });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
