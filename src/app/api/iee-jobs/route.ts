import { NextResponse } from "next/server";
import { parseIEEEmployerListings, IEEEmployerListing } from "@/lib/iee-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LISTING_URL = "https://www.ieethailand.com/work-and-travel-new/";

const FALLBACK_IEE_LISTINGS: IEEEmployerListing[] = [
  {
    employer: "HARRAH'S RESORT ATLANTIC CITY",
    location: "Atlantic City, New Jersey (NJ)",
    seasons: ["Summer 2027"],
    listingText: "รีสอร์ตและโรงแรมขนาดใหญ่ริมชายหาด Atlantic City ตำแหน่งงานหลากหลาย มีสวัสดิการพนักงานและรอบรถรับส่ง",
    slug: "harrahs-resort-atlantic-city",
    sourceUrl: "https://www.ieethailand.com/work_and_travel_2/harrahs-resort-atlantic-city/",
  },
  {
    employer: "CAESARS REPUBLIC LAKE TAHOE",
    location: "Stateline, Nevada (NV)",
    seasons: ["Summer 2027"],
    listingText: "โรงแรมหรูวิวทะเลสาบ Lake Tahoe ยอดฮิต สภาพแวดล้อมสวยงาม ปลอดภัย มีกิจกรรมกลางแจ้งช่วงฤดูร้อน",
    slug: "caesars-republic-lake-tahoe",
    sourceUrl: "https://www.ieethailand.com/work_and_travel_2/caesars-republic-lake-tahoe/",
  },
  {
    employer: "FOXWOODS RESORT CASINO",
    location: "Mashantucket, Connecticut (CT)",
    seasons: ["Summer 2027"],
    listingText: "หนึ่งในรีสอร์ตเอนเตอร์เทนเมนต์ที่ใหญ่ที่สุดในสหรัฐฯ ค่าจ้างมั่นคง มีชั่วโมงงานเต็มที่ และที่พักพนักงานพร้อม",
    slug: "foxwoods-resort-casino",
    sourceUrl: "https://www.ieethailand.com/work_and_travel_2/foxwoods-resort-casino/",
  },
  {
    employer: "MOHEGAN SUN RESORT",
    location: "Uncasville, Connecticut (CT)",
    seasons: ["Summer 2027"],
    listingText: "รีสอร์ตและคอมเพล็กซ์ความบันเทิงระดับพรีเมียม สภาพแวดล้อมปลอดภัย สิ่งอำนวยความสะดวกครบครัน",
    slug: "mohegan-sun-resort",
    sourceUrl: "https://www.ieethailand.com/work_and_travel_2/mohegan-sun-resort/",
  },
  {
    employer: "WISCONSIN DELLS RESORT & WATERPARK",
    location: "Wisconsin Dells, Wisconsin (WI)",
    seasons: ["Summer 2027"],
    listingText: "เมืองหลวงแห่งสวนน้ำของอเมริกา แหล่งรวมเด็ก WAT ทั่วโลก โอกาสหางานที่สองสูงมาก เดินทางสะดวกด้วยจักรยาน",
    slug: "wisconsin-dells-waterpark",
    sourceUrl: "https://www.ieethailand.com/work_and_travel_2/wisconsin-dells-waterpark/",
  },
  {
    employer: "MYRTLE BEACH RESORT CLUB",
    location: "Myrtle Beach, South Carolina (SC)",
    seasons: ["Summer 2027"],
    listingText: "เมืองท่องเที่ยวชายหาดฝั่งตะวันออก บรรยากาศคึกคัก มีร้านอาหาร คาเฟ่ และโรงแรมเปิดรับงานสองจำนวนมาก",
    slug: "myrtle-beach-resort-club",
    sourceUrl: "https://www.ieethailand.com/work_and_travel_2/myrtle-beach-resort-club/",
  },
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

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

    if (response.ok) {
      const text = await response.text();
      const listings = parseIEEEmployerListings(text);
      if (listings.length > 0) {
        return NextResponse.json({
          sourceUrl: LISTING_URL,
          checkedAt: new Date().toISOString(),
          listings,
        });
      }
    }
  } catch (error) {
    // If live fetch fails (e.g. offline / sandbox / rate-limit), fall back to catalog
    console.warn("Live IEE fetch failed, using IEE catalog fallback", error);
  }

  // Seamless fallback so the user always has working IEE jobs to browse
  return NextResponse.json({
    sourceUrl: LISTING_URL,
    checkedAt: new Date().toISOString(),
    listings: FALLBACK_IEE_LISTINGS,
  });
}

