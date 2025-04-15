import pool from './config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, userId, board } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ error: 'Missing name or userId' });
  }

  try {
    console.log('Creating project with:', { name, userId, board });

    const sql = 'INSERT INTO projects (name, board, members) VALUES ($1, $2, ARRAY[$3]) RETURNING *';
    const values = [name, board || {}, userId];

    const result = await pool.query(sql, values);
    

    res.status(200).json({ project: result.rows[0] });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
}
