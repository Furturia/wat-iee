import { NextResponse } from "next/server";
import { parseIEEPositions, IEEPosition } from "@/lib/iee-scraper";
import snapshotPositionsRaw from "@/data/iee-positions-snapshot.json";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const IEE_ORIGIN = "https://www.ieethailand.com";
const snapshotPositions = snapshotPositionsRaw as Record<string, IEEPosition[]>;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "รายการงานไม่ถูกต้อง" }, { status: 400 });
  }

  const sourceUrl = `${IEE_ORIGIN}/work_and_travel_2/${slug}/`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(sourceUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      const positions = parseIEEPositions(text);

      if (positions.length > 0) {
        return NextResponse.json({
          sourceUrl,
          checkedAt: new Date().toISOString(),
          positions,
        });
      }
    }
  } catch {
    // Network/scraping failed (e.g. Vercel/Netlify blocked IP), fall back to local snapshot
  }

  // Fallback to verified local positions snapshot
  const fallback = snapshotPositions[slug] || [];

  return NextResponse.json({
    sourceUrl,
    checkedAt: new Date().toISOString(),
    positions: fallback,
  });
}
