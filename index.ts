import express from "express";
import cors from "cors";
import { analyzeWebsite } from "./puppeteer.js";
import { runLighthouse } from "./lighthouse.js";
import type { Request, Response } from "express";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "Valid URL is required" });
    }
    const [puppeteerData, lighthouseData] = await Promise.all([
      analyzeWebsite(url),
      runLighthouse(url),
    ]);

    if ("error" in lighthouseData) {
      return res.status(500).json({ error: lighthouseData.error });
    }

    return res.json({ puppeteerData, lighthouseData: lighthouseData.report });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze website" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Analysis backend listening on port ${PORT}`);
});
