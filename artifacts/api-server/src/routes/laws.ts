import { Router } from "express";
import fs from "fs";
import path from "path";

const lawsRouter = Router();

// Load the Text file in memory
let taxCodePages: { page_id: number; text: string }[] = [];

function getTaxCodeData() {
  if (taxCodePages.length === 0) {
    try {
      // __dirname is dist/routes or src/routes, so we go up one level to get to src or dist, 
      // but data folder should be included in build, wait, TypeScript doesn't copy .txt files by default.
      // It's safer to use process.cwd() IF we run the app from api-server directory.
      // Let's use path.resolve(__dirname, "../../src/data/tax_code_2026_clean.txt")
      const filePath = path.join(__dirname, "../data/tax_code_2026_clean.txt");
      // Wait! __dirname will be dist/routes in production.
      // The txt file is in src/data. So from dist/routes it would be ../../src/data/tax_code_2026_clean.txt
      const isProd = __dirname.includes("dist");
      const actualPath = isProd 
        ? path.join(__dirname, "../../src/data/tax_code_2026_clean.txt")
        : path.join(__dirname, "../data/tax_code_2026_clean.txt");
        
      const fileContent = fs.readFileSync(actualPath, "utf8");
      
      // Split the text by "--- الصفحة X ---"
      const pageBlocks = fileContent.split(/---\s*الصفحة\s+\d+\s*---/);
      // The first element might be empty if the file starts with the separator
      
      let pageId = 1;
      // We extract the actual page number by matching the text, but since split removes it,
      // we can just assign sequential page IDs or parse them differently. 
      // A better split: match the whole separator to keep track of page numbers
      
      const regex = /---\s*الصفحة\s+(\d+)\s*---/g;
      let match;
      let lastIndex = 0;
      let parsedPages = [];
      
      while ((match = regex.exec(fileContent)) !== null) {
        if (lastIndex > 0) {
           const text = fileContent.substring(lastIndex, match.index).trim();
           if (text) {
             parsedPages.push({ page_id: pageId, text });
           }
        }
        pageId = parseInt(match[1]);
        lastIndex = match.index + match[0].length;
      }
      
      // Add the last page
      if (lastIndex > 0 && lastIndex < fileContent.length) {
        const text = fileContent.substring(lastIndex).trim();
        if (text) {
          parsedPages.push({ page_id: pageId, text });
        }
      }
      
      taxCodePages = parsedPages;
    } catch (err) {
      console.error("Error loading tax code data:", err);
      return [];
    }
  }
  return taxCodePages;
}

lawsRouter.get("/search", (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim() === "") {
    return res.json({ results: [] });
  }

  const pages = getTaxCodeData();
  const searchTerms = query.toLowerCase().split(" ").filter(t => t.length > 1);
  const results: any[] = [];

  for (const page of pages) {
    // Basic search: check if all search terms exist in the page text
    const pageTextLower = page.text.toLowerCase();
    const matchesAll = searchTerms.every(term => pageTextLower.includes(term));
    
    if (matchesAll) {
      // Find the paragraph/sentences containing the matches to avoid sending the whole page
      const paragraphs = page.text.split(/\n\s*\n/); // split by double newlines
      const matchedParagraphs = paragraphs.filter(p => {
        const pLower = p.toLowerCase();
        return searchTerms.some(term => pLower.includes(term));
      });
      
      if (matchedParagraphs.length > 0) {
         results.push({
           page_id: page.page_id,
           matches: matchedParagraphs.map((text, id) => ({ id, text: text.trim() }))
         });
      }
    }
  }

  res.json({ 
    query, 
    total_pages_matched: results.length,
    results: results.slice(0, 50) 
  });
});

lawsRouter.get("/page/:id", (req, res) => {
  const pageId = parseInt(req.params.id);
  const pages = getTaxCodeData();
  
  const page = pages.find((p) => p.page_id === pageId);
  if (!page) {
    return res.status(404).json({ error: "Page not found" });
  }

  res.json({ page });
});

export { lawsRouter };
