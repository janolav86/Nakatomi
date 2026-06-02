module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  var callsign = (req.query.callsign || "").toUpperCase().trim();
  if (!callsign) return res.status(400).json({ error: "callsign mangler" });

  try {
    var response = await fetch("https://api.adsb.fi/v1/callsign/" + encodeURIComponent(callsign));
    if (!response.ok) throw new Error("adsb.fi svarte med " + response.status);
    var data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
