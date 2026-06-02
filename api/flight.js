export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const callsign = (req.query.callsign || "").toUpperCase().trim();
  if (!callsign) return res.status(400).json({ error: "callsign mangler" });

  const response = await fetch(`https://api.airplanes.live/v2/callsign/${encodeURIComponent(callsign)}`);
  const data = await response.json();
  res.status(200).json(data);
}
