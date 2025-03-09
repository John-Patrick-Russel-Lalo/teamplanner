export default async function handler(req, res) {
    const pg = await import("pg");
    const { Pool } = pg;

    const pool = new Pool({
        connectionString: "postgresql://TPDB_owner:npg_hEIU5ZTVQi8A@ep-yellow-night-a8e2cfte-pooler.eastus2.azure.neon.tech/TPDB?sslmode=require"
    });

    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
}
