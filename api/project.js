import pool from './config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, userId } = req.query;

  if (!id || !userId) {
    return res.status(400).json({ error: 'Missing id or userId' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND $2 = ANY(members)',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ board: result.rows[0].board });
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
