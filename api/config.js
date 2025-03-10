const express = require("express");
const app = express();

app.get("/api/config", (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID }); // Replace with your actual Client ID
});

app.listen(3000, () => console.log("Server running on port 3000"));
