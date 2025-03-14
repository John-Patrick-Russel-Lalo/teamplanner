import { OAuth2Client } from 'google-auth-library';
import pool from './config';

const client = new OAuth2Client();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    console.log('Missing token');
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    console.log('Verifying token...');

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Your Google OAuth Client ID
    });

    const payload = ticket.getPayload(); 
    console.log('Payload:', payload);

    const { sub, email, name, picture } = payload;

    console.log('Saving to database:', { sub, email, name, picture });

    const query = `
      INSERT INTO users (id, email, name, picture)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) 
      DO UPDATE SET email = $2, name = $3, picture = $4
      RETURNING *;
    `;
    const values = [sub, email, name, picture];
    const result = await pool.query(query, values);

    console.log('User saved:', result.rows[0]);

    // ✅ Set token in cookies directly
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
