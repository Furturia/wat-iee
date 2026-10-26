import React from "react";
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { AppSettings, CalculationEvaluation, JobOffer } from "@/types";
import {
  formatCurrency,
  formatNumber,
  getAvailabilityBadge,
  getSafetyBadge,
  getSecondJobBadge,
} from "@/lib/formatters";

interface JobDetailModalProps {
  job: JobOffer | null;
  evaluation: CalculationEvaluation | null;
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailModal({
  job,
  evaluation,
  settings,
  isOpen,
  onClose,
}: JobDetailModalProps) {
  if (!isOpen || !job || !evaluation) return null;

  const isTHB = settings.currencyDisplay === "THB";
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${avail.className}`}
              >
                {avail.label}
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                {job.jobGroupType === "classic"
                  ? "IEE: Classic"
                  : job.jobGroupType === "signature"
                  ? "IEE: Signature"
                  : job.jobGroupType === "exclusive"
                  ? "IEE: Exclusive"
                  : job.jobGroupType === "ultimate"
                  ? "IEE: Ultimate"
                  : "IEE"}
              </span>
              {job.isDemo && (
                <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded border border-amber-200">
                  ข้อมูลจำลอง (Fictional Demo)
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {job.jobTitle} — {job.employerName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.city}, {job.state}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {evaluation.durationDays > 0
                  ? `${job.employmentStartDate || settings.globalStartDate} ถึง ${job.employmentEndDate || settings.globalEndDate} (${evaluation.durationDays} วัน / ${evaluation.durationWeeks} สัปดาห์)`
                  : "ยังไม่ระบุวัน"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700">
          {/* Highlight Section: Decision Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <span className="text-[11px] text-slate-500 block mb-1">
                เงินสดที่ต้องเตรียมก่อนบิน (Upfront Cash)
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {isTHB
                  ? formatCurrency(evaluation.upfrontCashTHB, "THB")
                  : formatCurrency(evaluation.upfrontCashUSD, "USD")}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                รวมมัดจำ ${evaluation.refundableDepositsUSD} + สำรอง $
                {evaluation.emergencyReserveUSD}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <span className="text-[11px] text-slate-500 block mb-1">
                ต้นทุนรวมตลอดทริป (Modeled Costs)
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {isTHB
                  ? formatCurrency(evaluation.totalModeledCostsTHB, "THB")
                  : formatCurrency(evaluation.totalModeledCostsUSD, "USD")}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                รวมค่าธรรมเนียม ตั๋วบิน ที่พัก และอาหาร
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                evaluation.netReturnUSD >= 0
                  ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/60 border-rose-200 text-rose-900"
              }`}
            >
              <span className="text-[11px] opacity-80 block mb-1">
                เงินเหลือสุทธิโดยประมาณ (Net Return)
              </span>
              <div className="text-base sm:text-lg font-black">
                {isTHB
                  ? formatCurrency(evaluation.netReturnTHB, "THB")
                  : formatCurrency(evaluation.netReturnUSD, "USD")}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {evaluation.netReturnUSD >= 0
                  ? "คาดว่าคืนทุนและมีเงินเหลือ"
                  : "เสี่ยงขาดทุนเทียบกับต้นทุนที่ตั้งไว้"}
              </div>
            </div>
          </div>

          {/* Break-Even Deep Dive */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              การวิเคราะห์จุดคืนทุน (Break-Even Analysis)
            </h3>
            {evaluation.isComplete ? (
              <div className="space-y-2 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  เมื่อคำนวณจากค่าจ้าง <strong>${job.hourlyWageUSD}/ชม.</strong>{" "}
                  หักประมาณการภาษี/ค่าใช้จ่าย{" "}
                  <strong>
                    {Math.round((job.estimatedDeductionRate ?? 0.1) * 100)}%
                  </strong>{" "}
                  (รายได้สุทธิตกชั่วโมงละ $
                  {formatNumber(
                    (job.hourlyWageUSD ?? 0) *
                      (1 - (job.estimatedDeductionRate ?? 0.1)),
                    2
                  )}
                  ) และระยะเวลาทำงานรวม{" "}
                  <strong>{evaluation.durationWeeks} สัปดาห์</strong>:
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-slate-500 text-[11px]">
                      ชั่วโมงทำงานเฉลี่ยที่ต้องการเพื่อคืนทุน:
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {evaluation.breakEvenHoursPerWeek} ชม./สัปดาห์
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[11px]">
                      ชั่วโมงที่นายจ้างเสนอ/คาดการณ์:
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        evaluation.isBreakEvenPossibleWithExpectedHours
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {job.expectedHoursPerWeek} ชม./สัปดาห์
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-slate-500 text-[11px]">ส่วนต่างชั่วโมง:</div>
                    <div
                      className={`text-base font-bold ${
                        evaluation.hoursShortfallOrSurplus >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {evaluation.hoursShortfallOrSurplus >= 0
                        ? `+${evaluation.hoursShortfallOrSurplus} ชม. (ปลอดภัย)`
                        : `ขาดอีก ${Math.abs(evaluation.hoursShortfallOrSurplus)} ชม.`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                <div className="font-semibold mb-1">
                  ไม่สามารถคำนวณจุดคืนทุนได้เนื่องจากข้อมูลยังไม่ครบ:
                </div>
                <ul className="list-disc list-inside">
                  {evaluation.missingFields.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Scenarios Table: Low / Expected / High */}
          {evaluation.isComplete && (
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                สถานการณ์จำลองตามชั่วโมงทำงาน (Scenarios)
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">สถานการณ์</th>
                      <th className="py-2.5 px-3 text-right">ชม./สัปดาห์</th>
                      <th className="py-2.5 px-3 text-right">รายได้รวมก่อนหัก</th>
                      <th className="py-2.5 px-3 text-right">รายได้สุทธิหลังหัก</th>
                      <th className="py-2.5 px-3 text-right">เงินเหลือสุทธิ</th>
                      <th className="py-2.5 px-3 text-center">คืนทุนไหม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Low Scenario */}
                    {evaluation.scenarios.low && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          กรณีได้ชั่วโมงน้อย (Low)
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {evaluation.scenarios.low.hoursPerWeek} ชม.
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(
                            evaluation.scenarios.low.grossIncomeUSD,
                            "USD"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(
                            evaluation.scenarios.low.estimatedNetIncomeUSD,
                            "USD"
                          )}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            evaluation.scenarios.low.netReturnUSD >= 0
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {formatCurrency(
                            evaluation.scenarios.low.netReturnUSD,
                            "USD"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {evaluation.scenarios.low.isBreakEven ? (
                            <span className="text-emerald-700 font-semibold">คืนทุน</span>
                          ) : (
                            <span className="text-rose-700 font-semibold">ขาดทุน</span>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* Expected Scenario */}
                    {evaluation.scenarios.expected && (
                      <tr className="bg-sky-50/40 font-medium">
                        <td className="py-2.5 px-3 font-bold text-sky-900">
                          กรณีตามที่คาดการณ์ (Expected)
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-sky-900">
                          {evaluation.scenarios.expected.hoursPerWeek} ชม.
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          {formatCurrency(
                            evaluation.scenarios.expected.grossIncomeUSD,
                            "USD"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800">
                          {formatCurrency(
                            evaluation.scenarios.expected.estimatedNetIncomeUSD,
                            "USD"
                          )}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-black ${
                            evaluation.scenarios.expected.netReturnUSD >= 0
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {formatCurrency(
                            evaluation.scenarios.expected.netReturnUSD,
                            "USD"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {evaluation.scenarios.expected.isBreakEven ? (
                            <span className="text-emerald-700 font-bold">คืนทุน</span>
                          ) : (
                            <span className="text-rose-700 font-bold">ไม่คืนทุน</span>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* High Scenario */}
                    {evaluation.scenarios.high && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          กรณีชั่วโมงพีค (High / Overtime)
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {evaluation.scenarios.high.hoursPerWeek} ชม.
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(
                            evaluation.scenarios.high.grossIncomeUSD,
                            "USD"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(
                            evaluation.scenarios.high.estimatedNetIncomeUSD,
                            "USD"
                          )}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            evaluation.scenarios.high.netReturnUSD >= 0
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {formatCurrency(
                            evaluation.scenarios.high.netReturnUSD,
                            "USD"
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {evaluation.scenarios.high.isBreakEven ? (
                            <span className="text-emerald-700 font-semibold">คืนทุน</span>
                          ) : (
                            <span className="text-rose-700 font-semibold">ไม่คืนทุน</span>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Safety & Second Job Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-xl border ${safety.className}`}>
              <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 shrink-0" />
                <span>ความปลอดภัยของเมือง: {safety.label}</span>
              </div>
              <p className="text-xs leading-relaxed mb-2">
                {job.safetyAssessment?.notes || "ยังไม่มีบันทึกรายละเอียด"}
              </p>
              <div className="text-[10px] opacity-75">
                แหล่งข้อมูล: {job.safetyAssessment?.sourceName || "User entered"}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${secondJob.className}`}>
              <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>โอกาสหางานที่สอง: {secondJob.label}</span>
              </div>
              <p className="text-xs leading-relaxed mb-2">
                {job.secondJobInfo?.notes || "ยังไม่มีบันทึกรายละเอียด"}
              </p>
              {job.secondJobInfo?.potentialExtraHoursPerWeek && (
                <div className="text-[11px] font-semibold">
                  คาดว่ามีเวลาทำเพิ่มได้ประมาณ +
                  {job.secondJobInfo.potentialExtraHoursPerWeek} ชม./สัปดาห์
                </div>
              )}
            </div>
          </div>

          {/* Cost Items List */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              รายการต้นทุนที่ใช้ในการคำนวณ (Cost Breakdown)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* One time */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                <div className="font-semibold text-slate-800 text-xs border-b pb-1">
                  ค่าใช้จ่ายก้อนเดียว (รวม ${Math.round(evaluation.totalOneTimeCostsUSD)})
                </div>
                <div className="space-y-1.5">
                  {job.oneTimeCosts.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">{c.label}</span>
                      <span className="font-bold text-slate-800">
                        {c.amount !== undefined
                          ? formatCurrency(c.amount, c.currency)
                          : "ยังไม่ระบุ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                <div className="font-semibold text-slate-800 text-xs border-b pb-1">
                  ค่าใช้จ่ายรายสัปดาห์ (${Math.round(evaluation.weeklyRecurringCostUSD)}
                  /สัปดาห์ × {evaluation.durationWeeks} สัปดาห์)
                </div>
                <div className="space-y-1.5">
                  {job.weeklyCosts.map((w, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">{w.label}</span>
                      <span className="font-bold text-slate-800">
                        {w.amount !== undefined
                          ? `${formatCurrency(w.amount, w.currency)}/สัปดาห์`
                          : "ยังไม่ระบุ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 font-semibold text-xs text-white transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

