import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const listingsPath = path.join(rootDir, "src", "data", "iee-listings-snapshot.json");
const outputPath = path.join(rootDir, "src", "data", "iee-positions-snapshot.json");

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);?/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);?/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(value) {
  return decodeHtml(
    value
      .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/[\t\r\n ]+/g, " ")
    .trim();
}

function getText(value, pattern) {
  return htmlToText(value.match(pattern)?.[1] ?? "");
}

function parseIEEPositions(html) {
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? [];
  const positions = [];

  for (const row of rows) {
    if (!/data-mtr-content=["']Position\s*:/i.test(row)) continue;

    const cells = Array.from(row.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi));
    const getCell = (label) =>
      cells.find((cell) =>
        new RegExp(`data-mtr-content=["']${label}\\s*:`, "i").test(cell[1])
      )?.[2] ?? "";
    const positionCell = getCell("Position");
    const wageCell = getCell("Hourly Wage");
    const descriptionCell = getCell("Job Description");
    const position = htmlToText(
      positionCell.match(
        /<div[^>]*class=["'][^"']*program-position-title[^"']*["'][^>]*>([\s\S]*?)(?:<br\b|<div)/i
      )?.[1] ?? ""
    );

    if (!position) continue;

    const englishLevel = getText(
      positionCell,
      /<div[^>]*class=["'][^"']*program-position-tips[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
    ).replace(/^English Level:\s*/i, "");
    const hourlyWageText =
      getText(
        wageCell,
        /<div[^>]*class=["'][^"']*position-count[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
      ) || htmlToText(wageCell);
    const wageNotes = htmlToText(wageCell).replace(hourlyWageText, "").trim();
    const description = htmlToText(descriptionCell).replace(
      /\s*Read more\s*$/i,
      ""
    );

    positions.push({
      position,
      englishLevel: englishLevel || null,
      hourlyWageText: hourlyWageText || null,
      wageNotes: wageNotes || null,
      description: description || null,
    });
  }

  return positions;
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.text();
      }
      console.warn(`[HTTP ${res.status}] ${url} (attempt ${attempt}/${retries})`);
    } catch (err) {
      console.warn(`[Fetch error] ${url}: ${err.message} (attempt ${attempt}/${retries})`);
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

async function main() {
  const listings = JSON.parse(fs.readFileSync(listingsPath, "utf-8"));
  console.log(`Starting sync for ${listings.length} employers...`);

  const positionsMap = {};
  const concurrency = 4;
  let completed = 0;

  for (let i = 0; i < listings.length; i += concurrency) {
    const chunk = listings.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (item) => {
        const url = `https://www.ieethailand.com/work_and_travel_2/${item.slug}/`;
        const html = await fetchWithRetry(url);
        if (html) {
          const positions = parseIEEPositions(html);
          positionsMap[item.slug] = positions;
          console.log(
            `[${++completed}/${listings.length}] ${item.slug}: found ${positions.length} positions`
          );
        } else {
          positionsMap[item.slug] = [];
          console.warn(`[${++completed}/${listings.length}] ${item.slug}: FAILED to fetch`);
        }
      })
    );
    // Be polite with rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  fs.writeFileSync(outputPath, JSON.stringify(positionsMap, null, 2), "utf-8");
  console.log(`\nSuccessfully saved ${Object.keys(positionsMap).length} employer snapshots to: ${outputPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

