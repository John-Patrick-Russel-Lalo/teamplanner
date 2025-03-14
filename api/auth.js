export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;

    if (token) {
      // Store the token in cookies
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);
      return res.status(200).json({ success: true });
    }
  }
  res.status(400).json({ error: 'Invalid request' });
}
