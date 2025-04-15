import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, userId } = req.query;

  if (!id || !userId) {
    return res.status(400).json({ error: 'Missing project id or user id' });
  }

  try {
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const project = user.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ board: project });
  } catch (err) {
    console.error('Error loading project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
