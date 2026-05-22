export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    })
  });

  const data = await response.json();

  // Returner hele svaret så vi kan se hva Strava sier
  if (data.errors || data.message) {
    return res.status(400).json({ 
      error: 'Token exchange failed',
      strava_message: data.message,
      strava_errors: data.errors,
      client_id_set: !!process.env.STRAVA_CLIENT_ID,
      client_secret_set: !!process.env.STRAVA_CLIENT_SECRET
    });
  }

  res.status(200).json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete: data.athlete
  });
}