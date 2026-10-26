import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Shield,
  Briefcase,
  Copy,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { AppSettings, CalculationEvaluation, JobOffer } from "@/types";
import {
  formatCurrency,
  formatNumber,
  getAvailabilityBadge,
  getSafetyBadge,
  getSecondJobBadge,
} from "@/lib/formatters";

interface JobCardProps {
  job: JobOffer;
  evaluation: CalculationEvaluation;
  settings: AppSettings;
  rank?: number;
  rankMetric?: string;
  onEdit: (job: JobOffer) => void;
  onDuplicate: (job: JobOffer) => void;
  onDelete: (id: string) => void;
  onViewDetails: (job: JobOffer) => void;
}

export function JobCard({
  job,
  evaluation,
  settings,
  rank,
  rankMetric,
  onEdit,
  onDuplicate,
  onDelete,
  onViewDetails,
}: JobCardProps) {
  const avail = getAvailabilityBadge(job.availabilityStatus);
  const safety = getSafetyBadge(job.safetyAssessment?.level, job.safetyAssessment?.score);
  const secondJob = getSecondJobBadge(job.secondJobInfo?.feasibility, job.secondJobInfo?.potentialExtraHoursPerWeek);

  const isTHB = settings.currencyDisplay === "THB";
  const isBoth = settings.currencyDisplay === "both";

  // Decision verdict
  const verdict = (() => {
    if (!evaluation.isComplete) return null;
    if (evaluation.isBreakEvenPossibleWithExpectedHours && evaluation.netReturnUSD > 0) {
      return { label: "คืนทุนได้ ✓", color: "emerald", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
    } else if (evaluation.hoursShortfallOrSurplus < 0 && Math.abs(evaluation.hoursShortfallOrSurplus) <= 5) {
      return { label: "เสี่ยงเล็กน้อย ⚠", color: "amber", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
    } else {
      return { label: "เสี่ยงไม่คืนทุน ✗", color: "rose", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" };
    }
  })();

  const groupLabel: Record<string, string> = {
    classic: "Classic",
    signature: "Signature",
    exclusive: "Exclusive",
    ultimate: "Ultimate",
    other: "IEE",
  };

  return (
    <div className={`bg-white rounded-xl border flex flex-col transition-all duration-200 hover:shadow-md ${
      job.availabilityStatus === "full"
        ? "border-slate-300 opacity-70 bg-slate-50/60"
        : "border-slate-200"
    }`}>
      {/* Rank badge (if shown) */}
      {rank && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-0">
          <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
            #{rank} {rankMetric}
          </span>
        </div>
      )}

      {/* ===== HEADER SECTION ===== */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${avail.className}`}>
                {avail.label}
              </span>
              <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {groupLabel[job.jobGroupType] ?? "IEE"}
              </span>
              {job.isDemo && (
                <span className="text-[10px] bg-amber-50 text-amber-700 font-medium px-1.5 py-0.5 rounded border border-amber-200">
                  ข้อมูลจำลอง
                </span>
              )}
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-tight truncate">{job.jobTitle}</h3>
            <p className="text-xs text-slate-500 truncate">{job.employerName}</p>
          </div>

          {/* Wage highlight */}
          <div className="shrink-0 text-center bg-sky-600 text-white rounded-xl px-3 py-2 shadow-sm">
            <div className="text-[10px] font-medium opacity-80">ค่าจ้าง/ชม.</div>
            <div className="text-xl font-black leading-none">${job.hourlyWageUSD ?? "?"}</div>
            <div className="text-[10px] opacity-75">≈ ฿{formatNumber((job.hourlyWageUSD ?? 0) * settings.exchangeRateTHBPerUSD, 0)}</div>
          </div>
        </div>

        {/* Location & Duration strip */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.city}, {job.state}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {evaluation.durationDays > 0 ? `${evaluation.durationDays} วัน (${evaluation.durationWeeks} สัปดาห์)` : "ยังไม่ระบุวัน"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {job.expectedHoursPerWeek ?? "?"} ชม./สัปดาห์
          </span>
        </div>
      </div>

      {/* ===== DECISION ZONE ===== */}
      <div className="px-4 pb-3 space-y-2.5">
        {/* Decision Verdict Banner */}
        <div className={`rounded-lg border px-3 py-2.5 ${
          verdict ? `${verdict.bg} ${verdict.border}` : "bg-slate-50 border-slate-200"
        }`}>
          {evaluation.isComplete && verdict ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${verdict.text}`}>
                  {verdict.color === "emerald" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {verdict.label}
                </span>
                <span className={`text-[11px] font-medium ${verdict.text}`}>
                  ต้องทำ {evaluation.breakEvenHoursPerWeek} ชม./สัปดาห์ เพื่อคืนทุน
                </span>
              </div>
              {/* Visual hours bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 ชม.</span>
                  <span>จุดคืนทุน {evaluation.breakEvenHoursPerWeek} ชม.</span>
                  <span>คาดได้ {job.expectedHoursPerWeek} ชม.</span>
                </div>
                <div className="h-2 bg-white border border-slate-200 rounded-full overflow-hidden relative">
                  {evaluation.breakEvenHoursPerWeek !== undefined && (
                    <div
                      className="absolute h-full bg-slate-300 rounded-full"
                      style={{ width: `${Math.min((evaluation.breakEvenHoursPerWeek / Math.max(evaluation.breakEvenHoursPerWeek, job.expectedHoursPerWeek ?? 40, 40)) * 100, 100)}%` }}
                    />
                  )}
                  <div
                    className={`absolute h-full rounded-full opacity-80 ${verdict.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${Math.min(((job.expectedHoursPerWeek ?? 0) / Math.max(evaluation.breakEvenHoursPerWeek ?? 40, job.expectedHoursPerWeek ?? 40, 40)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800">ข้อมูลยังไม่ครบสำหรับคำนวณจุดคืนทุน</span>
                  {evaluation.missingFields.length > 0 && (
                    <p className="text-amber-700 text-[11px] mt-0.5">
                      รอระบุ: {evaluation.missingFields.slice(0, 2).join(", ")}{evaluation.missingFields.length > 2 && "..."}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEdit(job)}
                className="shrink-0 text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded border border-sky-200 transition-colors"
              >
                + กรอกข้อมูล
              </button>
            </div>
          )}
        </div>

        {/* 3 Decision Factors row */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* City Safety */}
          <div className={`p-2 rounded-lg border text-center text-[10px] ${safety.className}`}>
            <div className="font-bold text-[11px] mb-0.5">🛡️ ปลอดภัย</div>
            <div className="font-black text-sm leading-none">{job.safetyAssessment?.score?.toFixed(1) ?? "?"}</div>
            <div className="text-[10px] opacity-80 truncate">{safety.label}</div>
          </div>

          {/* Second Job */}
          <div className={`p-2 rounded-lg border text-center text-[10px] ${secondJob.className}`}>
            <div className="font-bold text-[11px] mb-0.5">💼 งานสอง</div>
            <div className="font-black text-xs leading-none mt-1">
              {job.secondJobInfo?.potentialExtraHoursPerWeek ? `+${job.secondJobInfo.potentialExtraHoursPerWeek} ชม.` : secondJob.label}
            </div>
            <div className="text-[10px] opacity-80">{job.secondJobInfo?.feasibility === "high" ? "โอกาสสูง" : job.secondJobInfo?.feasibility === "medium" ? "ปานกลาง" : secondJob.label}</div>
          </div>

          {/* Net Return */}
          <div className={`p-2 rounded-lg border text-center text-[10px] ${
            evaluation.isComplete
              ? evaluation.netReturnUSD >= 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}>
            <div className="font-bold text-[11px] mb-0.5">💰 เงินเหลือ</div>
            <div className="font-black text-xs leading-none mt-1">
              {evaluation.isComplete
                ? (isTHB
                    ? formatCurrency(evaluation.netReturnTHB, "THB")
                    : formatCurrency(evaluation.netReturnUSD, "USD"))
                : "รอระบุครบ"}
            </div>
            <div className="text-[10px] opacity-80">
              {evaluation.isComplete ? (evaluation.netReturnUSD >= 0 ? "มีเงินเหลือ" : "เสี่ยงขาดทุน") : "ยังไม่ครบ"}
            </div>
          </div>
        </div>

        {/* Financial Summary Row */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px]">
            <div className="text-slate-500 font-medium">เงินสดก่อนบิน</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">
              {isTHB ? formatCurrency(evaluation.upfrontCashTHB, "THB") : formatCurrency(evaluation.upfrontCashUSD, "USD")}
            </div>
            {isBoth && <div className="text-slate-400 text-[10px]">≈ {formatCurrency(evaluation.upfrontCashTHB, "THB")}</div>}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px]">
            <div className="text-slate-500 font-medium">ต้นทุนทริปรวม</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">
              {isTHB ? formatCurrency(evaluation.totalModeledCostsTHB, "THB") : formatCurrency(evaluation.totalModeledCostsUSD, "USD")}
            </div>
            {isBoth && <div className="text-slate-400 text-[10px]">≈ {formatCurrency(evaluation.totalModeledCostsTHB, "THB")}</div>}
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex items-center justify-between">
        <button
          onClick={() => onViewDetails(job)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 hover:bg-sky-50 px-2 py-1.5 rounded transition-colors"
        >
          <span>แจกแจง Scenarios</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
          <button onClick={() => onDuplicate(job)} title="คัดลอก"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(job)} title="แก้ไข"
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-200 rounded transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(job.id)} title="ลบ"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
