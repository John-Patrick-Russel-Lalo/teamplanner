export default async function handler(req, res) {
    const pg = await import("pg");
    const { Pool } = pg;

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const { email } = req.query; // Get user email from frontend
        if (!email) {
            return res.status(400).json({ error: "Missing user email" });
        }

        const result = await pool.query(`
            SELECT p.id, p.name, u.name AS owner
            FROM projects p
            JOIN users u ON p.owner_id = u.id
            JOIN project_members pm ON p.id = pm.project_id
            JOIN users member ON pm.user_id = member.id
            WHERE member.email = $1;
        `, [email]);

        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
