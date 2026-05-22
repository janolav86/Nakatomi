export default async function handler(req, res) {
  const { base } = req.query;

  const response = await fetch(`https://api.frankfurter.app/latest?base=${base || 'NOK'}`);
  const data = await response.json();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(data);
}