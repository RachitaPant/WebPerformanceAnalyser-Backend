import express from "express";
import cors from "cors";
import { analyzeWebsite } from "./puppeteer";
import { runLighthouse } from "./lighthouse";
import type { Request, Response } from "express";

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.setTimeout(60000); // 60s timeout
  next();
});

app.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "Valid URL is required" });
    }

    const puppeteerData = await analyzeWebsite(url);
    const lighthouseData = await runLighthouse(url);

    if ("error" in lighthouseData) {
      return res.status(500).json({ error: lighthouseData.error });
    }

    return res.json({ puppeteerData, lighthouseData: lighthouseData.report });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze website" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Analysis backend listening on port ${PORT}`);
});
