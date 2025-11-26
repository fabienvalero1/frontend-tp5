import express from "express";
import cors from "cors";
import { getUsers, getUserById } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/users", async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    try {
        const { rows, total } = await getUsers(limit, offset);
        res.json({ data: rows, total });
    } catch (e) {
        res.status(500).json({ error: e.message || 'Erreur serveur' });
    }
});

app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    try {
        const user = await getUserById(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ data: user });
    } catch (e) {
        res.status(500).json({ error: e.message || 'Erreur serveur' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
});
