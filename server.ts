import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const MODELS = {
  FLASH: "gemini-3.5-flash",
  PRO: "gemini-3.1-pro-preview",
  IMAGE: "gemini-2.5-flash-image",
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON with a higher limit for images
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    const { history, currentParts } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: MODELS.FLASH,
        contents: [
          ...history,
          { role: "user", parts: currentParts }
        ],
        config: {
          systemInstruction: "You are Neuro AI, a helpful and intelligent assistant. When providing mathematical formulas, equations, or special characters, you MUST use LaTeX formatting. Use $...$ for inline math and $$...$$ for block math. Do not use \\(...\\) or \\[...\\].",
        }
      });
      res.json({ text: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate content" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: MODELS.IMAGE,
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let botResponseImage = null;
      let botResponseText = "";
      
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            botResponseImage = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            botResponseText += part.text;
          }
        }
      }
      res.json({ image: botResponseImage, text: botResponseText });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
