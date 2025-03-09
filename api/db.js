export default async function handler(req, res) {
    const pg = await import("pg");
    const { Pool } = pg;

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const result = await pool.query("SELECT * FROM projects");
        res.json(result.rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

