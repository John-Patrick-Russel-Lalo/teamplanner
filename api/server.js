require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use Neon PostgreSQL connection string
    ssl: { rejectUnauthorized: false }
});

// Save session to database
app.post("/api/save-session", async (req, res) => {
    const { user_id, project_id, progress } = req.body;
    try {
        await pool.query(`
            INSERT INTO user_sessions (user_id, project_id, progress, last_updated) 
            VALUES ($1, $2, $3, NOW()) 
            ON CONFLICT (user_id, project_id) 
            DO UPDATE SET progress = $3, last_updated = NOW();
        `, [user_id, project_id, progress]);

        res.json({ message: "Session saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error saving session" });
    }
});

// Restore session from database
app.get("/api/get-session", async (req, res) => {
    const { user_id, project_id } = req.query;
    try {
        const result = await pool.query(`
            SELECT progress FROM user_sessions WHERE user_id = $1 AND project_id = $2
        `, [user_id, project_id]);

        if (result.rows.length > 0) {
            res.json({ progress: result.rows[0].progress });
        } else {
            res.json({ progress: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving session" });
    }
});

// Start the server (if running locally)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
