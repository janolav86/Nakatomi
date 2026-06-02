// Airlines that operate under multiple ICAO codes
const VARIANTS = {
  NOZ: ['NOZ', 'NAX', 'IBK', 'NAN', 'NFD'],
  NAX: ['NAX', 'NOZ', 'IBK', 'NAN', 'NFD'],
  SAS: ['SAS', 'SCR'],
  RYR: ['RYR', 'RUK'],
  EZY: ['EZY', 'EZS'],
};

function getCallsigns(callsign) {
  const m = callsign.match(/^([A-Z]{2,3})(\d+.*)$/);
  if (!m) return [callsign];
  const [, prefix, num] = m;
  const variants = VARIANTS[prefix] || [prefix];
  return variants.map(v => v + num);
}

async function tryAirplanesLive(callsigns) {
  for (const cs of callsigns) {
    try {
      const r = await fetch(`https://api.airplanes.live/v2/callsign/${encodeURIComponent(cs)}`);
      if (!r.ok) continue;
      const d = await r.json();
      if (d.ac && d.ac.length > 0) return d;
    } catch (_) {}
  }
  return null;
}

async function tryOpenSky(callsigns) {
  try {
    const r = await fetch("https://opensky-network.org/api/states/all");
    if (!r.ok) return null;
    const d = await r.json();
    for (const cs of callsigns) {
      const match = (d.states || []).find(s => s[1] && s[1].trim().toUpperCase() === cs);
      if (match) {
        const s = match;
        return { ac: [{ hex: s[0], flight: (s[1]||'').trim(), lat: s[6], lon: s[5],
          alt_baro: s[7] != null ? Math.round(s[7] / 0.3048) : null,
          alt_geom: s[13] != null ? Math.round(s[13] / 0.3048) : null,
          gs: s[9] != null ? Math.round(s[9] / 0.5144) : null,
          track: s[10], on_ground: s[8], t: '', r: '' }] };
      }
    }
  } catch (_) {}
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const callsign = (req.query.callsign || "").toUpperCase().trim();
  if (!callsign) return res.status(400).json({ error: "callsign mangler" });

  const callsigns = getCallsigns(callsign);

  const result = await tryAirplanesLive(callsigns) || await tryOpenSky(callsigns);
  res.status(200).json(result || { ac: [] });
}
