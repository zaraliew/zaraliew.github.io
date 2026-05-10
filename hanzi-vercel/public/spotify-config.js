// api/spotify-config.js
// Returns the Spotify Client ID from Vercel environment variables.
// Set SPOTIFY_CLIENT_ID in your Vercel project settings → Environment Variables.
// The Client ID is safe to expose for PKCE flows (no client secret involved).

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({
    clientId: process.env.SPOTIFY_CLIENT_ID || ''
  });
};
