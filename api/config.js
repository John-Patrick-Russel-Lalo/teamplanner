export default function handler(req, res) {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
}
