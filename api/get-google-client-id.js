export default function handler(req, res) {
  if (req.method === 'GET') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'Google Client ID is not configured' });
    }
    res.status(200).json({ clientId });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
