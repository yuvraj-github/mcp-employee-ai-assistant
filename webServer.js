import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  connectMcp,
  askClaude,
  disconnectMcp
} from "./services/claudeService.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body || {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        error: "Question is too long"
      });
    }

    const answer = await askClaude(question);

    res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Unable to process your question"
    });
  }
});

// Connect MCP before starting Express
let httpServer;

async function startServer() {
  try {
    await connectMcp();

    httpServer = app.listen(PORT, () => {
      console.log(`Application running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exitCode = 1;
  }
}

startServer();

async function shutdown() {
  try {
    if (httpServer) {
      httpServer.close();
    }

    await disconnectMcp();
  } catch (error) {
    console.error("Shutdown error:", error);
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);