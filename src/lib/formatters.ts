import { AvailabilityStatus, SafetyLevel, SecondJobFeasibility } from "@/types";

export function formatCurrency(
  amount: number | undefined,
  currency: "USD" | "THB",
  showDecimals = false
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "ยังไม่ระบุ";
  }

  const symbol = currency === "USD" ? "$" : "฿";
  const formatted = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `${symbol}${formatted}`;
}

export function formatNumber(
  num: number | undefined,
  decimals = 1
): string {
  if (num === undefined || num === null || isNaN(num)) {
    return "-";
  }
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDateRange(
  startDateStr?: string,
  endDateStr?: string
): string {
  if (!startDateStr || !endDateStr) return "ยังไม่ระบุวัน";
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "วันที่ไม่ถูกต้อง";

  const thMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const startDay = start.getDate();
  const startMonth = thMonths[start.getMonth()];
  const endDay = end.getDate();
  const endMonth = thMonths[end.getMonth()];
  const endYear = end.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} - ${endDay} ${endMonth} ${endYear}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
}

export function getAvailabilityBadge(status: AvailabilityStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "open":
      return {
        label: "เปิดรับ",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "limited":
      return {
        label: "ใกล้เต็ม / จำกัด",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "full":
      return {
        label: "เต็มแล้ว",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "closed":
      return {
        label: "ปิดรับแล้ว",
        className: "bg-slate-100 text-slate-700 border-slate-300",
      };
    case "unknown":
    default:
      return {
        label: "ยังไม่ทราบสถานะ",
        className: "bg-gray-100 text-gray-600 border-gray-300",
      };
  }
}

export function getSafetyBadge(level?: SafetyLevel, score?: number): {
  label: string;
  subText: string;
  className: string;
  dotColor: string;
} {
  switch (level) {
    case "safe":
      return {
        label: "ปลอดภัยสูง",
        subText: score ? `คะแนน ${score}/5` : "ความเสี่ยงต่ำ",
        className: "bg-emerald-50 text-emerald-800 border-emerald-300",
        dotColor: "bg-emerald-500",
      };
    case "moderate":
      return {
        label: "ปลอดภัยปานกลาง",
        subText: score ? `คะแนน ${score}/5` : "ควรระวังบางพื้นที่",
        className: "bg-amber-50 text-amber-800 border-amber-300",
        dotColor: "bg-amber-500",
      };
    case "caution":
      return {
        label: "ควรระมัดระวัง",
        subText: score ? `คะแนน ${score}/5` : "มีรายงานความเสี่ยง",
        className: "bg-rose-50 text-rose-800 border-rose-300",
        dotColor: "bg-rose-500",
      };
    case "unknown":
    default:
      return {
        label: "ยังไม่มีข้อมูลความปลอดภัย",
        subText: "รอผู้ใช้ตรวจสอบ",
        className: "bg-slate-100 text-slate-700 border-slate-300",
        dotColor: "bg-slate-400",
      };
  }
}

export function getSecondJobBadge(feasibility?: SecondJobFeasibility, extraHours?: number): {
  label: string;
  subText: string;
  className: string;
  dotColor: string;
} {
  switch (feasibility) {
    case "high":
      return {
        label: "โอกาสสูงมาก",
        subText: extraHours ? `คาดว่าได้ +${extraHours} ชม./สัปดาห์` : "เมืองท่องเที่ยว/ร้านเยอะ",
        className: "bg-blue-50 text-blue-800 border-blue-300",
        dotColor: "bg-blue-500",
      };
    case "medium":
      return {
        label: "โอกาสปานกลาง",
        subText: extraHours ? `คาดว่าได้ +${extraHours} ชม./สัปดาห์` : "ขึ้นกับรอบรถ/ช่วงเวลา",
        className: "bg-teal-50 text-teal-800 border-teal-300",
        dotColor: "bg-teal-500",
      };
    case "low":
      return {
        label: "โอกาสน้อย",
        subText: "เมืองเงียบหรือไกลชุมชน",
        className: "bg-orange-50 text-orange-800 border-orange-300",
        dotColor: "bg-orange-500",
      };
    case "prohibited":
      return {
        label: "ไม่อนุญาต / กฎห้าม",
        subText: "นายจ้างหรือโครงการจำกัด",
        className: "bg-rose-50 text-rose-800 border-rose-300",
        dotColor: "bg-rose-500",
      };
    case "unknown":
    default:
      return {
        label: "ยังไม่ทราบข้อมูลงานสอง",
        subText: "รอตรวจสอบในพื้นที่",
        className: "bg-slate-100 text-slate-700 border-slate-300",
        dotColor: "bg-slate-400",
      };
  }
}

