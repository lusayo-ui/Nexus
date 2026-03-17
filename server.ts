import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Parser from "rss-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

const FEEDS = {
  reuters: "https://news.google.com/rss/search?q=source:Reuters&hl=en-US&gl=US&ceid=US:en",
  ap: "https://news.google.com/rss/search?q=source:Associated%20Press&hl=en-US&gl=US&ceid=US:en",
  ft: "https://www.ft.com/?format=rss",
  bloomberg: "https://news.google.com/rss/search?q=source:Bloomberg&hl=en-US&gl=US&ceid=US:en",
  foreign_affairs: "https://www.foreignaffairs.com/rss.xml",
  rand: "https://news.google.com/rss/search?q=source:RAND%20Corporation&hl=en-US&gl=US&ceid=US:en",
  bis: "https://news.google.com/rss/search?q=source:Bank%20for%20International%20Settlements&hl=en-US&gl=US&ceid=US:en",
  imf: "https://news.google.com/rss/search?q=source:International%20Monetary%20Fund&hl=en-US&gl=US&ceid=US:en"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // RSS Aggregation Endpoint
  app.get("/api/feeds", async (req, res) => {
    try {
      const feedPromises = Object.entries(FEEDS).map(async ([name, url]) => {
        try {
          const feed = await parser.parseURL(url);
          return {
            source: name,
            items: feed.items.slice(0, 5).map(item => ({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              contentSnippet: item.contentSnippet
            }))
          };
        } catch (e) {
          console.error(`Failed to fetch ${name}:`, e);
          return { source: name, items: [], error: true };
        }
      });

      const results = await Promise.all(feedPromises);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to aggregate feeds" });
    }
  });

  // Mock Email Endpoint
  app.post("/api/send-email", (req, res) => {
    const { email, reportTitle, reportContent } = req.body;
    console.log(`[MOCK EMAIL] Sending report to ${email}`);
    console.log(`Subject: ${reportTitle}`);
    // In a real app, integrate with SendGrid/Mailgun here
    res.json({ success: true, message: "Report sent to your email." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
