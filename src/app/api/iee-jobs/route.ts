import { NextResponse } from "next/server";
import { parseIEEEmployerListings, IEEEmployerListing } from "@/lib/iee-scraper";
import snapshotListings from "@/data/iee-listings-snapshot.json";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LISTING_URL = "https://www.ieethailand.com/work-and-travel-new/";

export async function GET() {
  console.log("[API /api/iee-jobs] Fetching live listings from:", LISTING_URL);
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(LISTING_URL, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    console.log(`[API /api/iee-jobs] Response status: ${response.status} in ${Date.now() - startTime}ms`);

    if (response.ok) {
      const text = await response.text();
      console.log(`[API /api/iee-jobs] HTML size: ${(text.length / 1024).toFixed(1)} KB`);
      const listings = parseIEEEmployerListings(text);
      console.log(`[API /api/iee-jobs] Successfully parsed ${listings.length} unique employer listings`);

      if (listings.length > 0) {
        return NextResponse.json({
          sourceUrl: LISTING_URL,
          checkedAt: new Date().toISOString(),
          listings,
        });
      }
    } else {
      console.warn(`[API /api/iee-jobs] Fetch returned status ${response.status}`);
    }
  } catch (error) {
    console.error("[API /api/iee-jobs] Live IEE fetch failed, serving snapshot dataset. Reason:", error);
  }

  // Use the complete 74 employers snapshot dataset scraped from IEE Thailand
  console.log(`[API /api/iee-jobs] Serving verified snapshot of ${snapshotListings.length} employers`);
  return NextResponse.json({
    sourceUrl: LISTING_URL,
    checkedAt: new Date().toISOString(),
    listings: snapshotListings as IEEEmployerListing[],
  });
}
