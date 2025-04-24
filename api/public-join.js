// /api/public-join.js
import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const result = await sql`SELECT project_id FROM invites WHERE token = ${token}`;
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invalid invite token" });
    }

    const projectId = result.rows[0].project_id;
    const projectData = await sql`SELECT * FROM projects WHERE id = ${projectId}`;

    return res.status(200).json({ project: projectData.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
