export default function handler(req, res) {
    res.json({ clientId: process.env.NEXT_PUBLIC_CLIENT_IDS });
}
