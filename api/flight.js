export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const callsign = (req.query.callsign || "").toUpperCase().trim();
  if (!callsign) return res.status(400).json({ error: "callsign mangler" });

  // Prøv airplanes.live først
  try {
    const r1 = await fetch(`https://api.airplanes.live/v2/callsign/${encodeURIComponent(callsign)}`);
    if (r1.ok) {
      const d1 = await r1.json();
      if (d1.ac && d1.ac.length > 0) return res.status(200).json(d1);
    }
  } catch (_) {}

  // Fallback: OpenSky — hent alle fly og filtrer
  try {
    const r2 = await fetch("https://opensky-network.org/api/states/all");
    if (r2.ok) {
      const d2 = await r2.json();
      const states = (d2.states || []).filter(s => s[1] && s[1].trim().toUpperCase() === callsign);
      if (states.length > 0) {
        const s = states[0];
        return res.status(200).json({
          ac: [{
            hex: s[0],
            flight: (s[1] || "").trim(),
            lat: s[6],
            lon: s[5],
            alt_baro: s[7] != null ? Math.round(s[7] / 0.3048) : null,
            alt_geom: s[13] != null ? Math.round(s[13] / 0.3048) : null,
            gs: s[9] != null ? Math.round(s[9] / 0.5144) : null,
            track: s[10],
            on_ground: s[8],
            t: "", r: ""
          }]
        });
      }
    }
  } catch (_) {}

  res.status(200).json({ ac: [] });
}
