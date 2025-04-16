import puppeteer from "puppeteer";
import { ScrapedData } from "../types";
import { config } from "../config/env";

// Helper function to validate image URLs
export function isValidImageUrl(url: string | null): boolean {
  if (!url) return false;
  if (url.startsWith("blob:")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Function to scrape URL content
export async function scrapeUrl(url: string): Promise<ScrapedData> {
  let browser;
  try {
    console.log(`Node environment: ${config.nodeEnv}`);
    console.log(
      `Puppeteer package version: ${require("puppeteer/package.json").version}`
    );

    let executablePath;
    if (config.puppeteerExecutablePath) {
      executablePath = config.puppeteerExecutablePath;
      console.log(`Using Chrome at: ${executablePath}`);
    } else {
      executablePath = puppeteer.executablePath();
      console.log(`Using bundled Chrome at: ${executablePath}`);
    }

    browser = await puppeteer.launch({
      executablePath,
      timeout: 30000, // Initial 30 second timeout
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();

    // Set shorter timeouts for page operations
    await page.setDefaultNavigationTimeout(30000); // 30 seconds
    await page.setDefaultTimeout(30000);

    // Navigate with shorter timeout and wait for DOM content to load
    await page.goto(url, {
      waitUntil: ["domcontentloaded"], // Changed from networkidle0
      timeout: 30000,
    });

    // Process content in chunks
    const content = await page.evaluate(() => {
      const CHUNK_SIZE = 5000; // Process 5000 characters at a time
      let allContent = '';
      
      // Get text content in chunks
      const processChunk = (elements: Element[], startIndex: number) => {
        const chunk = elements.slice(startIndex, startIndex + 10)
          .map(el => el.textContent)
          .filter(Boolean)
          .join(" ");
        return chunk;
      };

      const elements = Array.from(document.querySelectorAll('p, h1, h2, h3'));
      for(let i = 0; i < elements.length; i += 10) {
        allContent += processChunk(elements, i);
        if(allContent.length > CHUNK_SIZE * 3) break; // Limit total content
      }

      return allContent.trim();
    });

    // Extract title
    const title = await page.title();

    // Extract meta images in priority order
    const metaImage = await page.evaluate(() => {
      // Priority order for meta images
      const metaSelectors = [
        'meta[property="og:image"]', // Open Graph
        'meta[name="twitter:image"]', // Twitter Card
        'meta[property="og:image:secure_url"]', // Secure OG image
        'meta[itemprop="image"]', // Schema.org
        'link[rel="image_src"]', // Legacy
      ];

      for (const selector of metaSelectors) {
        const element = document.querySelector(selector);
        const content =
          element?.getAttribute("content") || element?.getAttribute("href");
        if (content) return content;
      }
      return null;
    });

    // Make URL absolute and validate
    const imageUrl = metaImage ? new URL(metaImage, url).toString() : null;
    const finalImageUrl = isValidImageUrl(imageUrl) ? imageUrl : null;

    return { title, content, imageUrl: finalImageUrl };
  } catch (error) {
    console.error("Error scraping URL:", error);
    if (error instanceof Error && error.message.includes("timeout")) {
      return {
        title: "Scraping Failed - Timeout",
        content:
          "The page took too long to load. This might be due to slow connection or complex page content.",
        imageUrl: null,
      };
    }
    if (error instanceof Error) {
      console.error(error.stack);
    } else {
      console.error("An unknown error occurred:", error);
    }
    return {
      title: "Failed to scrape",
      content: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      imageUrl: null,
    };
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}