"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const puppeteer_js_1 = require("./puppeteer.js");
const lighthouse_js_1 = require("./lighthouse.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/analyze", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url || !url.startsWith("http")) {
            return res.status(400).json({ error: "Valid URL is required" });
        }
        const [puppeteerData, lighthouseData] = await Promise.all([
            (0, puppeteer_js_1.analyzeWebsite)(url),
            (0, lighthouse_js_1.runLighthouse)(url),
        ]);
        if ("error" in lighthouseData) {
            return res.status(500).json({ error: lighthouseData.error });
        }
        return res.json({ puppeteerData, lighthouseData: lighthouseData.report });
    }
    catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ error: "Failed to analyze website" });
    }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Analysis backend listening on port ${PORT}`);
});
