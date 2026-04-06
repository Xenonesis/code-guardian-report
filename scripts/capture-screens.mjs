import { chromium } from "playwright";

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    colorScheme: "dark",
  });

  const urls = [
    { url: "http://localhost:3000/", file: "public/home.png" },
    { url: "http://localhost:3000/?tab=upload", file: "public/analysis.png" },
    { url: "http://localhost:3000/about", file: "public/about.png" },
    {
      url: "http://localhost:3000/github-analysis",
      file: "public/github-pro.png",
    },
    {
      url: "http://localhost:3000/?tab=ai-insights",
      file: "public/ai-config.png",
    },
    { url: "http://localhost:3000/?tab=reports", file: "public/cc.png" },
  ];

  for (const { url, file } of urls) {
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      // Wait for any animations to finish
      await page.waitForTimeout(1000);
      console.log(`Capturing ${file}...`);
      await page.screenshot({ path: file });
    } catch (e) {
      console.error(`Failed to capture ${url}:`, e.message);
    }
  }

  await browser.close();
  console.log("Done!");
}

run().catch(console.error);
