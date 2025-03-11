export default function handler(req, res) {
    res.status(200).json({ clientId: "597591645648-c6ainfa35peqmcqt8a9g1otr74vn3mgn.apps.googleusercontent.com" });
}

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;

