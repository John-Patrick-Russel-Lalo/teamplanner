import pool from './config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE $1 = ANY(members)`,
      [userId]
    );

    res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.error('Error fetching user projects:', err);
    res.status(500).json({ error: 'Failed to load projects' });
  }
}
