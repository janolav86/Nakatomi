const CLUB = 'kjederittet';
const RIDE_TYPES = new Set(['Ride', 'VirtualRide', 'GravelRide', 'MountainBikeRide', 'EBikeRide']);
const DATE_FROM = new Date('2026-01-01T00:00:00Z');
const DATE_TO   = new Date('2026-06-21T23:59:59Z');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const refreshRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_CLUB_REFRESH_TOKEN,
      grant_type:    'refresh_token'
    })
  });

  const tokenData = await refreshRes.json();
  if (!tokenData.access_token) {
    return res.status(500).json({ error: 'Token refresh failed', detail: tokenData });
  }

  const access_token = tokenData.access_token;
  let allActivities = [];
  let page = 1;

  while (page <= 25) {
    const r = await fetch(
      `https://www.strava.com/api/v3/clubs/${CLUB}/activities?per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) break;
    allActivities = allActivities.concat(data);
    if (data.length < 200) break;
    page++;
  }

  const rides = allActivities.filter(a => {
    const isRide = RIDE_TYPES.has(a.sport_type) || RIDE_TYPES.has(a.type);
    if (!isRide) return false;
    // Filter by date if start_date is available
    if (a.start_date) {
      const d = new Date(a.start_date);
      return d >= DATE_FROM && d <= DATE_TO;
    }
    return true;
  });

  const totalMeters = rides.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalKm = Math.round(totalMeters / 1000);

  const members = {};
  for (const a of rides) {
    const name = a.athlete.firstname + ' ' + a.athlete.lastname;
    if (!members[name]) members[name] = 0;
    members[name] += a.distance || 0;
  }

  const leaderboard = Object.entries(members)
    .map(([name, dist]) => ({ name, km: Math.round(dist / 1000) }))
    .sort((a, b) => b.km - a.km)
    .slice(0, 3);

  res.status(200).json({
    totalKm,
    leaderboard,
    count: rides.length,
    totalFetched: allActivities.length,
    pages: page - 1
  });
}
