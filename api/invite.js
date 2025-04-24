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
    // Check if user is already a member
    const check = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND $2 = ANY(members)',
      [projectId, userId]
    );

    if (check.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Already a member' });
    }

    // Add user to members array
    await pool.query(
      'UPDATE projects SET members = array_append(members, $1) WHERE id = $2',
      [userId, projectId]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
