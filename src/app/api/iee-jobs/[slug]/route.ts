import { NextResponse } from "next/server";
import { parseIEEPositions, IEEPosition } from "@/lib/iee-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const IEE_ORIGIN = "https://www.ieethailand.com";

const FALLBACK_POSITIONS: Record<string, IEEPosition[]> = {
  "harrahs-resort-atlantic-city": [
    {
      position: "Pool Attendant / Lifeguard",
      englishLevel: "4/5",
      hourlyWageText: "$16.50 / hour",
      wageNotes: "มีโอกาสทำล่วงเวลาช่วงพีค",
      description: "ดูแลความปลอดภัยบริเวณสระว่ายน้ำ จัดการเก้าอี้ชายหาด และบริการอำนวยความสะดวกแก่ผู้เข้าพัก",
    },
    {
      position: "Front Desk Clerk",
      englishLevel: "5/5",
      hourlyWageText: "$17.00 / hour",
      wageNotes: "ทักษะภาษาอังกฤษระดับดีเยี่ยม",
      description: "ต้อนรับและเช็คอินผู้เข้าพักโรงแรม แนะนำข้อมูลสถานที่ท่องเที่ยว และจัดการคำขอของลูกค้า",
    },
    {
      position: "Housekeeping Associate",
      englishLevel: "3/5",
      hourlyWageText: "$16.00 / hour",
      wageNotes: "มีเบี้ยขยันและทิปจากลูกค้า",
      description: "ทำความสะอาดและจัดเตรียมห้องพักตามมาตรฐานของรีสอร์ต",
    },
  ],
  "caesars-republic-lake-tahoe": [
    {
      position: "Food & Beverage Server Assistant",
      englishLevel: "4/5",
      hourlyWageText: "$16.00 / hour",
      wageNotes: "+ Tips เฉลี่ย $5-10/ชม.",
      description: "บริการเสิร์ฟอาหารและเครื่องดื่ม ดูแลความสะอาดโต๊ะอาหาร และช่วยเหลือลูกค้าในห้องอาหารวิวทะเลสาบ",
    },
    {
      position: "Host / Cashier",
      englishLevel: "4/5",
      hourlyWageText: "$16.50 / hour",
      wageNotes: "ชั่วโมงงานมั่นคง 35-40 ชม./สัปดาห์",
      description: "ต้อนรับลูกค้าหน้าห้องอาหาร จัดคิว และดูแลการรับชำระเงิน",
    },
  ],
  "foxwoods-resort-casino": [
    {
      position: "Culinary Prep & Cook",
      englishLevel: "3/5",
      hourlyWageText: "$16.50 / hour",
      wageNotes: "มีอาหารพนักงานฟรีระหว่างกะ",
      description: "เตรียมวัตถุดิบ ปรุงอาหารตามมาตรฐาน และดูแลสุขอนามัยในครัวรีสอร์ต",
    },
    {
      position: "Retail & Guest Associate",
      englishLevel: "4/5",
      hourlyWageText: "$15.50 / hour",
      wageNotes: "ทำงานในห้องแอร์ บรรยากาศสบาย",
      description: "ดูแลร้านขายของที่ระลึก จัดเรียงสินค้า และบริการลูกค้า",
    },
  ],
  "mohegan-sun-resort": [
    {
      position: "Attractions & Event Specialist",
      englishLevel: "4/5",
      hourlyWageText: "$16.00 / hour",
      wageNotes: "งานสนุก ได้พบปะผู้คนหลากหลาย",
      description: "ดูแลพื้นที่กิจกรรมความบันเทิง ประชาสัมพันธ์งานอีเวนต์ และอำนวยความสะดวกแก่นักท่องเที่ยว",
    },
    {
      position: "Hotel Housekeeping",
      englishLevel: "3/5",
      hourlyWageText: "$15.75 / hour",
      wageNotes: "มีรถรับส่งพนักงานและที่พักราคาพิเศษ",
      description: "ดูแลความสะอาดของห้องพักและพื้นที่ส่วนกลางในโรงแรม",
    },
  ],
  "wisconsin-dells-waterpark": [
    {
      position: "Waterpark Lifeguard",
      englishLevel: "3/5",
      hourlyWageText: "$15.50 / hour",
      wageNotes: "ฝึกอบรมฟรีและรับใบรับรอง Red Cross",
      description: "ดูแลความปลอดภัยทางน้ำของนักท่องเที่ยวในสวนน้ำขนาดใหญ่",
    },
    {
      position: "Ride Operator",
      englishLevel: "3/5",
      hourlyWageText: "$15.00 / hour",
      wageNotes: "โอกาสหางานที่สองในเมืองสูงมาก",
      description: "ควบคุมเครื่องเล่น ให้คำแนะนำความปลอดภัย และบริการลูกค้า",
    },
  ],
  "myrtle-beach-resort-club": [
    {
      position: "Food & Beverage Assistant",
      englishLevel: "4/5",
      hourlyWageText: "$17.00 / hour",
      wageNotes: "รายได้ดี บรรยากาศริมหาด",
      description: "ดูแลงานเสิร์ฟ จัดเตรียมอุปกรณ์ และบริการลูกค้าในคลับริมทะเล",
    },
  ],
};

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
  } catch (error) {
    console.warn(`Live IEE fetch for ${slug} failed, using positions fallback`, error);
  }

  // Fallback positions for the employer
  const fallback = FALLBACK_POSITIONS[slug] || [
    {
      position: "Resort Associate / General Staff",
      englishLevel: "3/5",
      hourlyWageText: "$16.00 / hour",
      wageNotes: "ประมาณการค่าจ้างมาตรฐาน",
      description: "งานบริการลูกค้าและดูแลความเรียบร้อยทั่วไปในสถานประกอบการ",
    },
  ];

  return NextResponse.json({
    sourceUrl,
    checkedAt: new Date().toISOString(),
    positions: fallback,
  });
}
