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
    const project = await pool.query('SELECT members FROM projects WHERE id = $1', [projectId]);

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const currentMembers = project.rows[0].members || [];

    if (!currentMembers.includes(userId)) {
      currentMembers.push(userId);

      await pool.query('UPDATE projects SET members = $1 WHERE id = $2', [
        currentMembers,
        projectId
      ]);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
