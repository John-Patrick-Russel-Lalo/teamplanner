export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const pg = await import("pg");
    const { Pool } = pg;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const { email, name, picture } = req.body;
        if (!email || !name) return res.status(400).json({ error: "Missing required fields" });

        console.log("Checking if user exists:", email);
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rowCount === 0) {
            console.log("Creating new user:", email);
            const insertResult = await pool.query(
                "INSERT INTO users (email, name, picture) VALUES ($1, $2, $3) RETURNING *",
                [email, name, picture]
            );
            res.json({ message: "User created", user: insertResult.rows[0] });
        } else {
            console.log("User already exists:", email);
            res.json({ message: "User exists", user: userResult.rows[0] });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
