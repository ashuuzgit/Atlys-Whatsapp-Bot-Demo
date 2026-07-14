import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { handleTurn, initialState, ChatState } from "./controller.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.get("/api/init", (_req, res) => {
  res.json({ messages: [], state: initialState() });
});

app.post("/api/message", (req, res) => {
  const { text, state } = req.body as { text: string; state: ChatState };
  if (!text || !state) {
    res.status(400).json({ error: "text and state required" });
    return;
  }
  res.json(handleTurn(text, state));
});

// Render / Railway inject PORT; fall back to 5055 for local dev.
const PORT = Number(process.env.PORT) || 5055;
app.listen(PORT, () => console.log(`Atlys visa web demo running on port ${PORT}`));
