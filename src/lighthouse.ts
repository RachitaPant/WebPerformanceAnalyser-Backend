import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import chromium from "@sparticuz/chromium";

import type { Result as LighthouseReport } from "lighthouse";

interface LighthouseResult {
  report: LighthouseReport;
}

export async function runLighthouse(
  url: string
): Promise<LighthouseResult | { error: string }> {
  if (!url) {
    return { error: "URL is required" };
  }

  let chromeInstance;
  try {
    const chromePath = await chromium.executablePath();
    console.log("Lighthouse chromePath:", chromePath);
    if (!chromePath) {
      return { error: "@sparticuz/chromium returned null executablePath" };
    }

    chromeInstance = await chromeLauncher.launch({
      chromePath,
      chromeFlags: [
        ...chromium.args,
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
    });

    const options = {
      logLevel: "info" as const,
      onlyCategories: ["performance"],
      port: chromeInstance.port,
      throttlingMethod: "provided" as const,
      output: "json" as const,
      maxWaitForLoad: 30000,
    };
    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      return { error: "Lighthouse did not return a result" };
    }

    return { report: runnerResult.lhr };
  } catch (error: unknown) {
    console.error("Lighthouse error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Lighthouse analysis failed: ${message}` };
  } finally {
    if (chromeInstance) {
      try {
        await chromeInstance.kill();
        console.log("Lighthouse Chrome instance closed successfully");
      } catch (killError) {
        console.error("Error closing Lighthouse Chrome instance:", killError);
      }
    }
  }
}
