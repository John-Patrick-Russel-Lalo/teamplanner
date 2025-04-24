import pool from './config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, userId } = req.body;

  if (!projectId || !userId) {
    return res.status(400).json({ error: 'Missing projectId or userId' });
  }

  try {
    // Add user to project members only if not already included
    await pool.query(
      `
      UPDATE projects
      SET members = array_append(members, $1)
      WHERE id = $2 AND NOT ($1 = ANY(members))
      `,
      [userId, projectId]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error joining project:', error);
    res.status(500).json({ error: 'Failed to join project' });
  }
}
