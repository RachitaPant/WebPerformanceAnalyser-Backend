import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

type LongTaskEntry = {
  name: string;
  startTime: number;
  duration: number;
};

export async function analyzeWebsite(url: string) {
  let browser;
  try {
    const executablePath = await chrome.executablePath;
    console.log("Puppeteer executablePath:", executablePath);
    if (!executablePath) {
      throw new Error("chrome-aws-lambda returned null executablePath");
    }

    browser = await puppeteer.launch({
      args: [
        ...chrome.args,
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Block heavy resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        ["image", "stylesheet", "font", "media"].includes(req.resourceType())
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const requests: string[] = [];
    page.on("request", (req) => {
      if (!req.isInterceptResolutionHandled()) {
        requests.push(req.url());
      }
    });

    await page.goto(url, { waitUntil: "load", timeout: 15000 });

    const performanceMetrics = await page.evaluate(() => {
      const perfData = window.performance;
      return {
        navigationTiming: JSON.parse(
          JSON.stringify(perfData.getEntriesByType("navigation")[0] || {})
        ),
        resourceTiming: JSON.parse(
          JSON.stringify(perfData.getEntriesByType("resource").slice(0, 20))
        ),
        paintTiming: JSON.parse(
          JSON.stringify(perfData.getEntriesByType("paint"))
        ),
      };
    });

    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        let LCP = 0;
        let CLS = 0;
        let FID = 0;

        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          LCP = lastEntry.startTime;
        });
        lcpObserver.observe({
          type: "largest-contentful-paint",
          buffered: true,
        });

        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            CLS += (entry as PerformanceEntry & { value: number }).value;
          }
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });

        const fidObserver = new PerformanceObserver((entryList) => {
          const entry = entryList.getEntries()[0] as PerformanceEventTiming;
          if (entry) FID = entry.processingStart;
        });
        fidObserver.observe({ type: "first-input", buffered: true });

        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
          resolve({ LCP, CLS, FID });
        }, 1000);
      });
    });

    const jsExecutionTime = await page.evaluate(() => {
      const start = performance.now();
      new Array(50000).fill(0).map((_, i) => i * 2);
      return performance.now() - start;
    });

    const domContentLoadedTime = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      return navEntry.domContentLoadedEventEnd - navEntry.startTime;
    });

    const unusedJSBytes = await page.evaluate(() => {
      return (
        performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      )
        .filter((r) => r.initiatorType === "script")
        .slice(0, 5)
        .map((script) => ({
          name: script.name,
          transferSize: script.transferSize,
          encodedBodySize: script.encodedBodySize,
        }));
    });

    const totalDomNodes = await page.evaluate(() => {
      return document.getElementsByTagName("*").length;
    });

    const thirdPartyRequests = requests.filter((req) => {
      try {
        const urlObj = new URL(req);
        return !urlObj.hostname.includes("yourdomain.com");
      } catch {
        return false;
      }
    });

    const resourceBreakdown = await page.evaluate(() => {
      const types: Record<string, number> = {};
      performance
        .getEntriesByType("resource")
        .slice(0, 20)
        .forEach((res) => {
          const type = (res as PerformanceResourceTiming).initiatorType;
          if (["css", "script", "img", "font"].includes(type)) {
            types[type] = (types[type] || 0) + 1;
          }
        });
      return types;
    });

    const longTasks = await page.evaluate(() => {
      return new Promise<LongTaskEntry[]>((resolve) => {
        const entries: LongTaskEntry[] = [];
        const observer = new PerformanceObserver((list) => {
          entries.push(
            ...list
              .getEntries()
              .map((e) => ({
                name: e.name,
                startTime: e.startTime,
                duration: e.duration,
              }))
              .slice(0, 5)
          );
        });
        observer.observe({ entryTypes: ["longtask"] });
        setTimeout(() => {
          observer.disconnect();
          resolve(entries);
        }, 1000);
      });
    });

    return {
      url,
      performanceMetrics,
      domContentLoadedTime,
      coreWebVitals,
      jsExecutionTime,
      networkRequests: requests.slice(0, 20),
      totalDomNodes,
      thirdPartyRequestsCount: thirdPartyRequests.length,
      resourceBreakdown,
      longTasks,
      unusedJSBytes,
    };
  } catch (error) {
    console.error("Puppeteer error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
