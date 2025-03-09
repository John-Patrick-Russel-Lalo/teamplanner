export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const pg = await import("pg");
    const { Pool } = pg;
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const { projectName, userEmail } = req.body;
        if (!projectName || !userEmail) {
            return res.status(400).json({ error: "Missing project name or user email" });
        }

        // Find the user ID by email
        const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [userEmail]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].id;

        // Insert new project
        const result = await pool.query(
            "INSERT INTO projects (name, owner_id) VALUES ($1, $2) RETURNING id",
            [projectName, userId]
        );

        const projectId = result.rows[0].id;

        // Automatically add the creator as a project member with "owner" role
        await pool.query(
            "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')",
            [projectId, userId]
        );

        res.json({ message: "Project created successfully!", projectId });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
