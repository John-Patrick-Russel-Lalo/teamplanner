export default function handler(req, res) {
  if (req.method === 'GET') {
    const clientId = "138635067715-9m4b1gi2r4837vu2qgttp889432ulord.apps.googleusercontent.com";
    if (!clientId) {
      return res.status(500).json({ error: 'Google Client ID is not configured' });
    }
    res.status(200).json({ clientId });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
