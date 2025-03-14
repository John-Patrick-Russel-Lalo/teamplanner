import { OAuth2Client } from 'google-auth-library';
import pool from './config';

const client = new OAuth2Client();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  } else {
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);
  }

  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Your Google OAuth Client ID
    });

    const payload = ticket.getPayload(); // Extract user info
    const { sub, email, name, picture } = payload; // sub = Google ID

    // Save user to database
    const query = `
      INSERT INTO users (id, email, name, picture)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) 
      DO UPDATE SET email = $2, name = $3, picture = $4
      RETURNING *;
    `;
    const values = [sub, email, name, picture];
    const result = await pool.query(query, values);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}
