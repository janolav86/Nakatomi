module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  var callsign = (req.query.callsign || "").toUpperCase().trim();
  if (!callsign) return res.status(400).json({ error: "callsign mangler" });

  var padded = (callsign + "        ").slice(0, 8);
  var url = "https://opensky-network.org/api/states/all?callsign=" + encodeURIComponent(padded);

  try {
    var response = await fetch(url);
    if (!response.ok) throw new Error("OpenSky svarte med " + response.status);
    var data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
