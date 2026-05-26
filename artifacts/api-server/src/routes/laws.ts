import { Router } from "express";
import fs from "fs";
import path from "path";

const lawsRouter = Router();

// Load the JSON in memory (it's around 2.6MB, perfectly fine)
let taxCodeData: any = null;

function getTaxCodeData() {
  if (!taxCodeData) {
    try {
      const filePath = path.join(process.cwd(), "src/data/tax_code_2026.json");
      const fileContent = fs.readFileSync(filePath, "utf8");
      taxCodeData = JSON.parse(fileContent);
    } catch (err) {
      console.error("Error loading tax code data:", err);
      // Fallback if not found
      return { pages: [] };
    }
  }
  return taxCodeData;
}

lawsRouter.get("/search", (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim() === "") {
    return res.json({ results: [] });
  }

  const data = getTaxCodeData();
  const searchTerms = query.toLowerCase().split(" ").filter(t => t.length > 1);
  const results: any[] = [];

  for (const page of data.pages) {
    if (!page.content) continue;
    
    // We will group matches per page
    const pageMatches: any[] = [];
    let pageText = "";

    for (const item of page.content) {
      if (item.type === "paragraph" && item.text) {
        pageText += item.text + " ";
        
        const itemTextLower = item.text.toLowerCase();
        const matchesAll = searchTerms.every(term => itemTextLower.includes(term));
        
        if (matchesAll) {
          pageMatches.push({
            id: item.id,
            text: item.text
          });
        }
      }
    }

    if (pageMatches.length > 0) {
      results.push({
        page_id: page.page_id,
        matches: pageMatches
      });
    }
  }

  // Limit results to avoid massive responses
  res.json({ 
    query, 
    total_pages_matched: results.length,
    results: results.slice(0, 50) 
  });
});

lawsRouter.get("/page/:id", (req, res) => {
  const pageId = parseInt(req.params.id);
  const data = getTaxCodeData();
  
  const page = data.pages.find((p: any) => p.page_id === pageId);
  if (!page) {
    return res.status(404).json({ error: "Page not found" });
  }

  res.json({ page });
});

export { lawsRouter };
