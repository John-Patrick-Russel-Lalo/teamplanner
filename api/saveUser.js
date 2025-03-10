import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, name, picture } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const result = await pool.query(
            "INSERT INTO users (email, name, picture) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET name = $2, picture = $3 RETURNING *",
            [email, name, picture]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
