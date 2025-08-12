import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import chrome from "chrome-aws-lambda";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chromium: any = require("chromium");

import type { Result as LighthouseReport } from "lighthouse";

interface LighthouseResult {
  report: LighthouseReport;
}

export async function runLighthouse(
  url: string
): Promise<LighthouseResult | { error: string }> {
  const executablePath = (await chrome.executablePath) || chromium.path;

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    const chromeInstance = await chromeLauncher.launch({
      chromePath: executablePath,
      chromeFlags: [...chrome.args, "--disable-gpu"], // Add for optimization
    });
    const options: {
      logLevel: "info";
      onlyCategories: string[];
      port: number;
    } = {
      logLevel: "info",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chromeInstance.port,
    };

    const runnerResult = await lighthouse(url, options);

    await chromeInstance.kill();

    if (!runnerResult) {
      return { error: "Lighthouse did not return a result" };
    }

    return { report: runnerResult.lhr };
  } catch (error: unknown) {
    console.error("Lighthouse error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Lighthouse analysis failed: ${message}` };
  }
}
