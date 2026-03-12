export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: 'title required' });

  const query = [title, artist].filter(Boolean).join(' ');

  // ── 1. Try Shazam ──────────────────────────────────────────────────────────
  try {
    const searchRes = await fetch(
      `https://www.shazam.com/discovery/v5/en-US/US/web/-/search?query=${encodeURIComponent(query)}&numResults=5&locale=en-US`,
      { headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.shazam.com/',
      }}
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const track = searchData?.tracks?.hits?.[0]?.track;
      if (track?.key) {
        const trackRes = await fetch(
          `https://www.shazam.com/discovery/v5/en-US/US/web/-/track/${track.key}`,
          { headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.shazam.com/',
          }}
        );
        if (trackRes.ok) {
          const trackData = await trackRes.json();
          const lyricSection = trackData?.sections?.find(s => s.type === 'LYRICS');
          const lines = lyricSection?.text;
          if (lines?.length) {
            const lrc = lines
              .filter(l => l.trim())
              .map((l, i) => {
                const mm = String(Math.floor(i*4/60)).padStart(2,'0');
                const ss = String((i*4)%60).padStart(2,'0');
                return `[${mm}:${ss}.00]${l}`;
              }).join('\n');
            return res.json({ source: 'shazam', title: track.title, artist: track.subtitle, lrc });
          }
        }
      }
    }
  } catch (e) { console.error('Shazam:', e.message); }

  // ── 2. Try LRCLIB ──────────────────────────────────────────────────────────
  try {
    const r = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'HanziApp/1.0' }
    });
    if (r.ok) {
      const results = await r.json();
      const hit = results?.find(r => r.syncedLyrics);
      if (hit?.syncedLyrics) {
        return res.json({ source: 'lrclib', title: hit.trackName, artist: hit.artistName, lrc: hit.syncedLyrics });
      }
    }
  } catch (e) { console.error('LRCLIB:', e.message); }

  return res.json({ error: 'not_found' });
}
