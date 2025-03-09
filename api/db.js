export default async function handler(req, res) {
    const pg = await import("pg");
    const { Pool } = pg;

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
}
