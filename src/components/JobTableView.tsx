import React from "react";
import { AppSettings, CalculationEvaluation, JobOffer } from "@/types";
import {
  formatCurrency,
  formatNumber,
  getAvailabilityBadge,
  getSafetyBadge,
  getSecondJobBadge,
} from "@/lib/formatters";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  Edit2,
  Trash2,
  Copy,
} from "lucide-react";

interface JobTableViewProps {
  jobs: JobOffer[];
  evaluations: Record<string, CalculationEvaluation>;
  settings: AppSettings;
  rankMetric?: string;
  onEdit: (job: JobOffer) => void;
  onDuplicate: (job: JobOffer) => void;
  onDelete: (id: string) => void;
  onViewDetails: (job: JobOffer) => void;
}

export function JobTableView({
  jobs,
  evaluations,
  settings,
  rankMetric,
  onEdit,
  onDuplicate,
  onDelete,
  onViewDetails,
}: JobTableViewProps) {
  const isTHB = settings.currencyDisplay === "THB";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4">ตำแหน่งงาน / นายจ้าง</th>
              <th className="py-3 px-3">เมือง / รัฐ</th>
              <th className="py-3 px-3">สถานะ</th>
              <th className="py-3 px-3">ความปลอดภัย</th>
              <th className="py-3 px-3">โอกาสงาน 2</th>
              <th className="py-3 px-3">ระยะเวลา</th>
              <th className="py-3 px-3 text-right">ค่าจ้าง/ชม.</th>
              <th className="py-3 px-3 text-right">ชม./สัปดาห์</th>
              <th className="py-3 px-3 text-right">จุดคืนทุน</th>
              <th className="py-3 px-3 text-right">เงินสดก่อนบิน</th>
              <th className="py-3 px-3 text-right">เงินเหลือสุทธิ</th>
              <th className="py-3 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job, idx) => {
              const ev = evaluations[job.id];
              const avail = getAvailabilityBadge(job.availabilityStatus);
              const safety = getSafetyBadge(
                job.safetyAssessment?.level,
                job.safetyAssessment?.score
              );
              const secondJob = getSecondJobBadge(
                job.secondJobInfo?.feasibility,
                job.secondJobInfo?.potentialExtraHoursPerWeek
              );

              return (
                <tr
                  key={job.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    job.availabilityStatus === "full" ? "opacity-60 bg-slate-50/50" : ""
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                      {idx + 1}
                    </span>
                  </td>

                  {/* Title & Employer */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 leading-tight">
                      {job.jobTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{job.employerName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-medium">
                        {job.jobGroupType === "classic"
                          ? "Classic"
                          : job.jobGroupType === "signature"
                          ? "Signature"
                          : job.jobGroupType === "exclusive"
                          ? "Exclusive"
                          : job.jobGroupType === "ultimate"
                          ? "Ultimate"
                          : "IEE"}
                      </span>
                      {job.isDemo && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>

                  {/* City/State */}
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {job.city}, {job.state}
                  </td>

                  {/* Availability */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${avail.className}`}
                    >
                      {avail.label}
                    </span>
                  </td>

                  {/* Safety */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${safety.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${safety.dotColor}`} />
                      {safety.label}
                    </span>
                  </td>

                  {/* Second Job */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${secondJob.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${secondJob.dotColor}`} />
                      {secondJob.label}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {ev?.durationWeeks > 0
                      ? `${ev.durationWeeks} สัปดาห์ (${ev.durationDays} วัน)`
                      : "-"}
                  </td>

                  {/* Wage */}
                  <td className="py-3.5 px-3 text-right font-bold text-sky-700 whitespace-nowrap">
                    ${formatNumber(job.hourlyWageUSD, 2)}
                  </td>

                  {/* Hours */}
                  <td className="py-3.5 px-3 text-right text-slate-700 font-semibold whitespace-nowrap">
                    {job.expectedHoursPerWeek ?? "-"} ชม.
                  </td>

                  {/* Break-even */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {ev?.isComplete ? (
                      <div className="inline-flex items-center justify-end gap-1">
                        <span className="font-bold text-slate-900">
                          {ev.breakEvenHoursPerWeek} ชม.
                        </span>
                        {ev.isBreakEvenPossibleWithExpectedHours ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                    ) : (
                      <span className="text-amber-600 font-medium">รอระบุเพิ่ม</span>
                    )}
                  </td>

                  {/* Upfront Cash */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                    {ev
                      ? isTHB
                        ? formatCurrency(ev.upfrontCashTHB, "THB")
                        : formatCurrency(ev.upfrontCashUSD, "USD")
                      : "-"}
                  </td>

                  {/* Net Return */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {ev ? (
                      <span
                        className={`font-bold ${
                          ev.netReturnUSD >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isTHB
                          ? formatCurrency(ev.netReturnTHB, "THB")
                          : formatCurrency(ev.netReturnUSD, "USD")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewDetails(job)}
                        title="ดูรายละเอียด"
                        className="p-1 text-sky-600 hover:bg-sky-50 rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicate(job)}
                        title="คัดลอก"
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(job)}
                        title="แก้ไข"
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(job.id)}
                        title="ลบ"
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

