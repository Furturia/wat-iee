import React, { useState } from "react";
import {
  X,
  Zap,
  Settings,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Shield,
  Briefcase,
  Building,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import {
  AvailabilityStatus,
  JobGroupType,
  JobOffer,
  MoneyInput,
  SafetyLevel,
  SecondJobFeasibility,
  WeeklyCostInput,
} from "@/types";
import { getIEEGroupDefaultCosts, feeConfig } from "@/lib/fee-config";
import { calculateDateDuration } from "@/lib/calculations";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobOffer) => void;
  initialJob?: JobOffer | null;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

// =========================================================
// QUICK ADD MODE — fills defaults from config automatically
// =========================================================
function QuickAddForm({
  onSave,
  onClose,
  defaultStartDate,
  defaultEndDate,
}: {
  onSave: (job: JobOffer) => void;
  onClose: () => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [groupType, setGroupType] = useState<JobGroupType>("ultimate");
  const [hourlyWage, setHourlyWage] = useState("16.00");
  const [expectedHours, setExpectedHours] = useState("35");
  const [startDate, setStartDate] = useState(defaultStartDate || "2027-06-01");
  const [endDate, setEndDate] = useState(defaultEndDate || "2027-08-25");
  const [airfareTHB, setAirfareTHB] = useState("36000");
  const [housingUSD, setHousingUSD] = useState("120");
  const [foodUSD, setFoodUSD] = useState("80");
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>("safe");
  const [safetyScore, setSafetyScore] = useState("4.0");
  const [secondJobFeasibility, setSecondJobFeasibility] = useState<SecondJobFeasibility>("medium");
  const [extraHours, setExtraHours] = useState("10");
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus>("open");
  const [errors, setErrors] = useState<string[]>([]);

  const duration = calculateDateDuration(startDate, endDate);
  const feeDetails = feeConfig.groupTypes[groupType === "other" ? "ultimate" : groupType];

  const groupLabel: Record<string, string> = {
    classic: `Classic — รวมค่าธรรมเนียม ~${feeDetails?.knownFixedFeeSubtotalTHB?.toLocaleString()} ฿ + $185`,
    signature: `Signature — รวมค่าธรรมเนียม ~${feeDetails?.knownFixedFeeSubtotalTHB?.toLocaleString()} ฿ + $185`,
    exclusive: `Exclusive — รวมค่าธรรมเนียม ~${feeDetails?.knownFixedFeeSubtotalTHB?.toLocaleString()} ฿ + $185`,
    ultimate: `Ultimate — รวมค่าธรรมเนียม ~${feeDetails?.knownFixedFeeSubtotalTHB?.toLocaleString()} ฿ + $185`,
  };

  const handleQuickSave = () => {
    const errs: string[] = [];
    if (!jobTitle.trim()) errs.push("ชื่อตำแหน่งงาน");
    if (!employerName.trim()) errs.push("ชื่อนายจ้าง");
    if (!city.trim()) errs.push("เมือง");
    if (!state.trim()) errs.push("รัฐ");
    if (!hourlyWage || isNaN(parseFloat(hourlyWage))) errs.push("ค่าจ้างต่อชั่วโมง");
    if (errs.length > 0) { setErrors(errs); return; }

    const autoGroupKey = (groupType === "other" ? "ultimate" : groupType) as "classic" | "signature" | "exclusive" | "ultimate";
    const baseCosts = getIEEGroupDefaultCosts(groupType);
    const airfare: MoneyInput = {
      id: "fee-airfare",
      category: "airfare",
      label: "ค่าตั๋วเครื่องบินไป-กลับ",
      currency: "THB",
      amount: airfareTHB ? parseFloat(airfareTHB) : undefined,
      paidUpfront: true,
      source: { status: airfareTHB ? "user_entered" : "unknown" },
    };
    const costsWithAirfare = [
      ...baseCosts.filter((c) => c.category !== "airfare"),
      airfare,
    ];

    const job: JobOffer = {
      id: `job-${Date.now()}`,
      jobTitle: jobTitle.trim(),
      employerName: employerName.trim(),
      agency: "IEE Thailand",
      jobGroupType: groupType,
      availabilityStatus: availStatus,
      city: city.trim(),
      state: state.trim(),
      employmentStartDate: startDate,
      employmentEndDate: endDate,
      hourlyWageUSD: parseFloat(hourlyWage),
      expectedHoursPerWeek: parseFloat(expectedHours) || 35,
      lowHoursPerWeek: Math.max(15, (parseFloat(expectedHours) || 35) - 8),
      highHoursPerWeek: (parseFloat(expectedHours) || 35) + 8,
      estimatedDeductionRate: 0.10,
      safetyAssessment: {
        level: safetyLevel,
        score: safetyScore ? parseFloat(safetyScore) : undefined,
        sourceName: "User entered",
      },
      secondJobInfo: {
        feasibility: secondJobFeasibility,
        potentialExtraHoursPerWeek: extraHours ? parseFloat(extraHours) : undefined,
      },
      oneTimeCosts: costsWithAirfare,
      weeklyCosts: [
        { id: "housing", label: "ค่าที่พัก (Housing)", currency: "USD", amount: housingUSD ? parseFloat(housingUSD) : undefined, category: "housing" },
        { id: "food", label: "ค่าอาหาร (Food)", currency: "USD", amount: foodUSD ? parseFloat(foodUSD) : undefined, category: "food" },
      ],
      refundableDepositsUSD: 150,
      emergencyReserveUSD: 300,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(job);
    onClose();
  };

  return (
    <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
      {errors.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>กรุณากรอก: <strong>{errors.join(", ")}</strong></span>
        </div>
      )}

      {/* Job Essentials */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน (Job Title) *</label>
            <input type="text" required placeholder="เช่น Lifeguard, Server, Housekeeping" value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อนายจ้าง *</label>
            <input type="text" required placeholder="เช่น Dells Waterpark, Grand Lodge" value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เมือง *</label>
            <input type="text" required placeholder="เช่น Wisconsin Dells, Myrtle Beach" value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">รัฐ (State) *</label>
            <input type="text" required placeholder="เช่น Wisconsin, SC, Colorado" value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      {/* IEE Group & Fees auto-fill */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 space-y-2.5 text-xs">
        <div className="font-bold text-sky-900 text-sm flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-sky-600" />
          กลุ่มโครงการ IEE (ค่าธรรมเนียมจะถูกเติมอัตโนมัติ)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(["classic", "signature", "exclusive", "ultimate"] as JobGroupType[]).map((g) => {
            const gdata = feeConfig.groupTypes[g as keyof typeof feeConfig.groupTypes];
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGroupType(g)}
                className={`text-left px-3 py-2.5 rounded-lg border-2 transition-all ${
                  groupType === g
                    ? "border-sky-500 bg-sky-100 text-sky-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="font-bold text-xs">{gdata?.labelTh || g}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  รวม ~{gdata?.knownFixedFeeSubtotalTHB?.toLocaleString() ?? "?"} ฿ + $185
                </div>
                <div className="text-[10px] mt-0.5 font-medium">
                  ค่ากลุ่มงาน: {gdata?.fees?.groupProcessingFeeTHB === 0 ? "ไม่มี (0 ฿)" : `${(gdata?.fees?.groupProcessingFeeTHB ?? 8000).toLocaleString()} ฿`}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-sky-700">
          * ค่าธรรมเนียมจาก config จะถูกเติมอัตโนมัติ — กรอกเพิ่มแค่ ตั๋วเครื่องบิน, ที่พัก, และอาหาร
        </p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">วันเริ่มงาน</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">วันสิ้นสุดงาน</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
        </div>
        <div className="flex items-end">
          {duration.isValid ? (
            <div className="w-full bg-sky-600 text-white text-center py-2 rounded-lg font-bold text-sm">
              {duration.days} วัน<br />
              <span className="text-xs font-normal">({Math.round(duration.weeks * 10) / 10} สัปดาห์)</span>
            </div>
          ) : (
            <div className="w-full bg-slate-100 text-slate-500 text-center py-2 rounded-lg text-xs">{duration.error}</div>
          )}
        </div>
      </div>

      {/* Wage & Hours */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">ค่าจ้างต่อชั่วโมง ($/ชม.) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input type="number" step="0.25" min="5" max="100" required
              value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 outline-none focus:border-sky-500 font-bold text-slate-800 text-base" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">ชั่วโมงต่อสัปดาห์ที่คาดไว้</label>
          <input type="number" step="1" min="15" max="80"
            value={expectedHours} onChange={(e) => setExpectedHours(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-bold text-slate-800" />
        </div>
      </div>

      {/* Costs (only the variables not in config) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            ค่าตั๋วเครื่องบินไป-กลับ (บาท)
            <span className="ml-1 text-rose-600 font-normal">*สำคัญมาก</span>
          </label>
          <input type="number" step="1000" placeholder="เช่น 36000 (ยังไม่รู้ใส่ว่าง)"
            value={airfareTHB} onChange={(e) => setAirfareTHB(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold text-slate-800" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">ค่าที่พักต่อสัปดาห์ ($/สัปดาห์)</label>
          <input type="number" step="5" placeholder="เช่น 95, 120"
            value={housingUSD} onChange={(e) => setHousingUSD(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold text-slate-800" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">ค่าอาหารต่อสัปดาห์ ($/สัปดาห์)</label>
          <input type="number" step="5" placeholder="เช่น 75, 100"
            value={foodUSD} onChange={(e) => setFoodUSD(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold text-slate-800" />
        </div>
      </div>

      {/* Safety & Second Job */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 space-y-2">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            ความปลอดภัยของเมือง (ประเมินเอง)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={safetyLevel} onChange={(e) => setSafetyLevel(e.target.value as SafetyLevel)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1.5 font-medium text-xs">
              <option value="safe">🟢 ปลอดภัยสูง</option>
              <option value="moderate">🟡 ปานกลาง</option>
              <option value="caution">🔴 ควรระวัง</option>
              <option value="unknown">⚪ ยังไม่ทราบ</option>
            </select>
            <input type="number" step="0.5" min="1" max="5"
              value={safetyScore} onChange={(e) => setSafetyScore(e.target.value)}
              placeholder="คะแนน 1-5" className="bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-semibold" />
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 space-y-2">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            โอกาสหางานที่สอง
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={secondJobFeasibility} onChange={(e) => setSecondJobFeasibility(e.target.value as SecondJobFeasibility)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1.5 font-medium text-xs">
              <option value="high">⚡ สูงมาก</option>
              <option value="medium">🔷 ปานกลาง</option>
              <option value="low">🔸 น้อย</option>
              <option value="prohibited">🚫 ไม่อนุญาต</option>
              <option value="unknown">❓ ยังไม่ทราบ</option>
            </select>
            <input type="number" step="1" min="0" max="30"
              value={extraHours} onChange={(e) => setExtraHours(e.target.value)}
              placeholder="+ชม./สัปดาห์" className="bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-semibold" />
          </div>
        </div>
      </div>

      {/* Availability status */}
      <div className="text-xs">
        <label className="block font-semibold text-slate-700 mb-1">สถานะการรับสมัคร</label>
        <div className="flex flex-wrap gap-2">
          {(["open", "limited", "full", "closed", "unknown"] as AvailabilityStatus[]).map((s) => {
            const labels: Record<string, string> = { open: "✅ เปิดรับ", limited: "⚠️ ใกล้เต็ม", full: "🔴 เต็มแล้ว", closed: "⛔ ปิดรับ", unknown: "❓ ยังไม่ทราบ" };
            return (
              <button key={s} type="button" onClick={() => setAvailStatus(s)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${availStatus === s ? "border-sky-500 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
          ยกเลิก
        </button>
        <button type="button" onClick={handleQuickSave}
          className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          บันทึกข้อเสนองาน
        </button>
      </div>
    </div>
  );
}

// =========================================================
// DETAILED ADD/EDIT MODE (full form, same as before but cleaner)
// =========================================================
function DetailedForm({
  onSave,
  onClose,
  initialJob,
  defaultStartDate,
  defaultEndDate,
}: {
  onSave: (job: JobOffer) => void;
  onClose: () => void;
  initialJob?: JobOffer | null;
  defaultStartDate?: string;
  defaultEndDate?: string;
}) {
  const [jobTitle, setJobTitle] = useState(initialJob?.jobTitle || "");
  const [employerName, setEmployerName] = useState(initialJob?.employerName || "");
  const [city, setCity] = useState(initialJob?.city || "");
  const [state, setState] = useState(initialJob?.state || "");
  const [jobGroupType, setJobGroupType] = useState<JobGroupType>(initialJob?.jobGroupType || "ultimate");
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(initialJob?.availabilityStatus || "unknown");
  const [startDate, setStartDate] = useState(initialJob?.employmentStartDate || defaultStartDate || "2027-06-01");
  const [endDate, setEndDate] = useState(initialJob?.employmentEndDate || defaultEndDate || "2027-08-25");
  const [hourlyWageUSD, setHourlyWageUSD] = useState(initialJob?.hourlyWageUSD !== undefined ? String(initialJob.hourlyWageUSD) : "16.0");
  const [expectedHours, setExpectedHours] = useState(initialJob?.expectedHoursPerWeek !== undefined ? String(initialJob.expectedHoursPerWeek) : "35");
  const [lowHours, setLowHours] = useState(initialJob?.lowHoursPerWeek !== undefined ? String(initialJob.lowHoursPerWeek) : "");
  const [highHours, setHighHours] = useState(initialJob?.highHoursPerWeek !== undefined ? String(initialJob.highHoursPerWeek) : "");
  const [safetyLevel, setSafetyLevel] = useState<SafetyLevel>(initialJob?.safetyAssessment?.level || "safe");
  const [safetyScore, setSafetyScore] = useState(initialJob?.safetyAssessment?.score !== undefined ? String(initialJob.safetyAssessment.score) : "4.5");
  const [safetyNotes, setSafetyNotes] = useState(initialJob?.safetyAssessment?.notes || "");
  const [secondJobFeasibility, setSecondJobFeasibility] = useState<SecondJobFeasibility>(initialJob?.secondJobInfo?.feasibility || "medium");
  const [secondJobNotes, setSecondJobNotes] = useState(initialJob?.secondJobInfo?.notes || "");
  const [extraHours, setExtraHours] = useState(initialJob?.secondJobInfo?.potentialExtraHoursPerWeek !== undefined ? String(initialJob.secondJobInfo.potentialExtraHoursPerWeek) : "");
  const [oneTimeCosts, setOneTimeCosts] = useState<MoneyInput[]>(
    initialJob?.oneTimeCosts?.length ? initialJob.oneTimeCosts : getIEEGroupDefaultCosts("ultimate")
  );
  const [weeklyCosts, setWeeklyCosts] = useState<WeeklyCostInput[]>(
    initialJob?.weeklyCosts?.length ? initialJob.weeklyCosts : [
      { id: "housing", label: "ค่าที่พัก (Housing)", currency: "USD", amount: 120, category: "housing" },
      { id: "food", label: "ค่าอาหารและของใช้", currency: "USD", amount: 80, category: "food" },
    ]
  );
  const [depositsUSD, setDepositsUSD] = useState(initialJob?.refundableDepositsUSD !== undefined ? String(initialJob.refundableDepositsUSD) : "150");
  const [reserveUSD, setReserveUSD] = useState(initialJob?.emergencyReserveUSD !== undefined ? String(initialJob.emergencyReserveUSD) : "300");
  const [deductionRate, setDeductionRate] = useState(initialJob?.estimatedDeductionRate !== undefined ? String(initialJob.estimatedDeductionRate * 100) : "10");
  const [notes, setNotes] = useState(initialJob?.notes || "");

  const duration = calculateDateDuration(startDate, endDate);

  const handleApplyIEEGroupDefaults = (group: JobGroupType) => {
    setJobGroupType(group);
    setOneTimeCosts(getIEEGroupDefaultCosts(group));
  };

  const handleSubmit = () => {
    const wage = parseFloat(hourlyWageUSD);
    const expHours = parseFloat(expectedHours);

    const job: JobOffer = {
      id: initialJob?.id || `job-${Date.now()}`,
      jobTitle: jobTitle.trim() || "ข้อเสนองาน",
      employerName: employerName.trim() || "นายจ้าง",
      city: city.trim() || "ไม่ระบุ",
      state: state.trim() || "USA",
      agency: "IEE Thailand",
      jobGroupType,
      availabilityStatus,
      availabilityCheckedAt: new Date().toISOString().split("T")[0],
      employmentStartDate: startDate || undefined,
      employmentEndDate: endDate || undefined,
      hourlyWageUSD: isNaN(wage) ? undefined : wage,
      expectedHoursPerWeek: isNaN(expHours) ? undefined : expHours,
      lowHoursPerWeek: lowHours ? parseFloat(lowHours) : undefined,
      highHoursPerWeek: highHours ? parseFloat(highHours) : undefined,
      safetyAssessment: {
        level: safetyLevel,
        score: safetyScore ? parseFloat(safetyScore) : undefined,
        notes: safetyNotes || undefined,
        sourceName: "User entered",
      },
      secondJobInfo: {
        feasibility: secondJobFeasibility,
        notes: secondJobNotes || undefined,
        potentialExtraHoursPerWeek: extraHours ? parseFloat(extraHours) : undefined,
      },
      oneTimeCosts,
      weeklyCosts,
      refundableDepositsUSD: depositsUSD ? parseFloat(depositsUSD) : 0,
      emergencyReserveUSD: reserveUSD ? parseFloat(reserveUSD) : 0,
      estimatedDeductionRate: deductionRate ? parseFloat(deductionRate) / 100 : 0.1,
      notes: notes || undefined,
      isDemo: initialJob?.isDemo ?? false,
      createdAt: initialJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(job);
    onClose();
  };

  return (
    <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 text-xs">
      {/* Employer Info */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-sky-600" />
          1. ข้อมูลตำแหน่งงานและนายจ้าง
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน *</label>
            <input type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              placeholder="เช่น Resort Associate, Lifeguard"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อนายจ้าง *</label>
            <input type="text" required value={employerName} onChange={(e) => setEmployerName(e.target.value)}
              placeholder="เช่น Grand Forest Lodge"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เมือง *</label>
            <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">รัฐ *</label>
            <input type="text" required value={state} onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">กลุ่มโครงการ IEE</label>
            <select value={jobGroupType} onChange={(e) => handleApplyIEEGroupDefaults(e.target.value as JobGroupType)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium bg-white">
              <option value="classic">IEE Classic (ส่วนที่ 2: 59,900฿ / ค่ากลุ่ม: 0฿)</option>
              <option value="signature">IEE Signature (ส่วนที่ 2: 54,900฿ / ค่ากลุ่ม: 8,000฿)</option>
              <option value="exclusive">IEE Exclusive (ส่วนที่ 2: 59,900฿ / ค่ากลุ่ม: 8,000฿)</option>
              <option value="ultimate">IEE Ultimate (ส่วนที่ 2: 63,900฿ / ค่ากลุ่ม: 8,000฿)</option>
              <option value="other">กลุ่มงานอื่น / กำหนดเอง</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">สถานะรับสมัคร</label>
            <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium bg-white">
              <option value="open">เปิดรับสมัคร</option>
              <option value="limited">ใกล้เต็ม / จำนวนจำกัด</option>
              <option value="full">เต็มแล้ว</option>
              <option value="closed">ปิดรับแล้ว</option>
              <option value="unknown">ยังไม่ทราบ</option>
            </select>
          </div>
        </div>
      </section>

      {/* Dates */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-sky-600" />
          2. วันที่เริ่มงาน - สิ้นสุด
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">วันเริ่มงาน</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">วันสิ้นสุดงาน</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
        </div>
        {duration.isValid && (
          <div className="text-sky-800 bg-sky-50 p-2 rounded-lg border border-sky-100 flex justify-between">
            <span>ระยะเวลาการจ้างงาน:</span>
            <span className="font-bold">{duration.days} วัน ({Math.round(duration.weeks * 10) / 10} สัปดาห์)</span>
          </div>
        )}
      </section>

      {/* Wage & Hours */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-sky-600" />
          3. ค่าจ้างและชั่วโมงทำงาน
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">ค่าจ้างต่อชั่วโมง ($/ชม.) *</label>
            <input type="number" step="0.25" min="5" max="100" required value={hourlyWageUSD} onChange={(e) => setHourlyWageUSD(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-bold text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชม./สัปดาห์ (คาดการณ์) *</label>
            <input type="number" step="1" min="10" max="80" value={expectedHours} onChange={(e) => setExpectedHours(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-bold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชม. ต่ำสุด (Low Case)</label>
            <input type="number" step="1" value={lowHours} onChange={(e) => setLowHours(e.target.value)} placeholder="ไม่บังคับ"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500" />
          </div>
        </div>
      </section>

      {/* Safety & Second Job */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          4. ความปลอดภัยและโอกาสงานที่สอง
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ระดับความปลอดภัย</label>
                <select value={safetyLevel} onChange={(e) => setSafetyLevel(e.target.value as SafetyLevel)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 bg-white font-medium">
                  <option value="safe">🟢 ปลอดภัยสูง</option>
                  <option value="moderate">🟡 ปานกลาง</option>
                  <option value="caution">🔴 ควรระวัง</option>
                  <option value="unknown">⚪ ยังไม่ทราบ</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">คะแนน (1-5)</label>
                <input type="number" step="0.1" min="1" max="5" value={safetyScore} onChange={(e) => setSafetyScore(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 bg-white font-semibold" />
              </div>
            </div>
            <input type="text" placeholder="บันทึกรายละเอียดความปลอดภัย..." value={safetyNotes} onChange={(e) => setSafetyNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5" />
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">โอกาสงานที่สอง</label>
                <select value={secondJobFeasibility} onChange={(e) => setSecondJobFeasibility(e.target.value as SecondJobFeasibility)}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 bg-white font-medium">
                  <option value="high">⚡ สูงมาก</option>
                  <option value="medium">🔷 ปานกลาง</option>
                  <option value="low">🔸 น้อย</option>
                  <option value="prohibited">🚫 ไม่อนุญาต</option>
                  <option value="unknown">❓ ยังไม่ทราบ</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">+ชม./สัปดาห์ที่ได้เพิ่ม</label>
                <input type="number" step="1" min="0" value={extraHours} onChange={(e) => setExtraHours(e.target.value)} placeholder="เช่น 12"
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 bg-white font-semibold" />
              </div>
            </div>
            <input type="text" placeholder="บันทึกโอกาสหางานที่สอง..." value={secondJobNotes} onChange={(e) => setSecondJobNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5" />
          </div>
        </div>
      </section>

      {/* One-Time Costs */}
      <section className="space-y-2">
        <div className="flex items-center justify-between border-b pb-1.5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-sky-600" />
            5. ค่าใช้จ่ายก้อนเดียว (One-Time)
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleApplyIEEGroupDefaults(jobGroupType)}
              className="text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded border border-sky-200 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />รีเซ็ตค่าธรรมเนียม IEE
            </button>
            <button type="button" onClick={() => setOneTimeCosts([...oneTimeCosts, { id: `c-${Date.now()}`, label: "ค่าใช้จ่ายเพิ่มเติม", currency: "THB", amount: undefined, paidUpfront: true }])}
              className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1">
              <Plus className="w-3 h-3" />เพิ่ม
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          {oneTimeCosts.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <input type="text" value={item.label} onChange={(e) => { const u = [...oneTimeCosts]; u[idx] = { ...u[idx], label: e.target.value }; setOneTimeCosts(u); }}
                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1.5 outline-none font-medium" />
              <select value={item.currency} onChange={(e) => { const u = [...oneTimeCosts]; u[idx] = { ...u[idx], currency: e.target.value as "USD" | "THB" }; setOneTimeCosts(u); }}
                className="w-20 bg-white border border-slate-300 rounded px-1 py-1.5 font-medium">
                <option value="THB">฿ THB</option>
                <option value="USD">$ USD</option>
              </select>
              <input type="number" step="1" placeholder="ยังไม่ระบุ"
                value={item.amount !== undefined ? item.amount : ""}
                onChange={(e) => { const u = [...oneTimeCosts]; u[idx] = { ...u[idx], amount: e.target.value !== "" ? parseFloat(e.target.value) : undefined }; setOneTimeCosts(u); }}
                className="w-28 bg-white border border-slate-300 rounded px-2 py-1.5 text-right font-bold" />
              <button type="button" onClick={() => setOneTimeCosts(oneTimeCosts.filter((_, i) => i !== idx))}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Costs */}
      <section className="space-y-2">
        <div className="flex items-center justify-between border-b pb-1.5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-sky-600" />
            6. ค่าใช้จ่ายรายสัปดาห์
          </h3>
          <button type="button" onClick={() => setWeeklyCosts([...weeklyCosts, { id: `w-${Date.now()}`, label: "ค่าใช้จ่ายรายสัปดาห์", currency: "USD", amount: undefined }])}
            className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-300 flex items-center gap-1">
            <Plus className="w-3 h-3" />เพิ่ม
          </button>
        </div>
        <div className="space-y-1.5">
          {weeklyCosts.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <input type="text" value={item.label} onChange={(e) => { const u = [...weeklyCosts]; u[idx] = { ...u[idx], label: e.target.value }; setWeeklyCosts(u); }}
                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1.5 outline-none font-medium" />
              <select value={item.currency} onChange={(e) => { const u = [...weeklyCosts]; u[idx] = { ...u[idx], currency: e.target.value as "USD" | "THB" }; setWeeklyCosts(u); }}
                className="w-20 bg-white border border-slate-300 rounded px-1 py-1.5 font-medium">
                <option value="USD">$ USD</option>
                <option value="THB">฿ THB</option>
              </select>
              <input type="number" step="1" placeholder="จำนวน/สัปดาห์"
                value={item.amount !== undefined ? item.amount : ""}
                onChange={(e) => { const u = [...weeklyCosts]; u[idx] = { ...u[idx], amount: e.target.value !== "" ? parseFloat(e.target.value) : undefined }; setWeeklyCosts(u); }}
                className="w-28 bg-white border border-slate-300 rounded px-2 py-1.5 text-right font-bold" />
              <button type="button" onClick={() => setWeeklyCosts(weeklyCosts.filter((_, i) => i !== idx))}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </section>

      {/* Deposit & Reserve */}
      <section className="space-y-2">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5">7. เงินมัดจำ / เงินสำรองฉุกเฉิน / อัตราหักภาษีประมาณการ</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">มัดจำที่พัก (USD)</label>
            <input type="number" value={depositsUSD} onChange={(e) => setDepositsUSD(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เงินสำรอง (USD)</label>
            <input type="number" value={reserveUSD} onChange={(e) => setReserveUSD(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">หักภาษีประมาณการ (%)</label>
            <input type="number" value={deductionRate} onChange={(e) => setDeductionRate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold" />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
          ยกเลิก
        </button>
        <button type="button" onClick={handleSubmit}
          className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors">
          {initialJob ? "บันทึกการแก้ไข" : "บันทึกข้อเสนองาน"}
        </button>
      </div>
    </div>
  );
}

// =========================================================
// MAIN MODAL WRAPPER
// =========================================================
export function JobModal({
  isOpen,
  onClose,
  onSave,
  initialJob,
  defaultStartDate,
  defaultEndDate,
}: JobModalProps) {
  if (!isOpen) return null;

  const isEditing = !!initialJob;
  const [mode, setMode] = useState<"quick" | "detailed">(isEditing ? "detailed" : "quick");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {isEditing ? "แก้ไขข้อมูลข้อเสนองาน" : "เพิ่มข้อเสนองานของ IEE"}
            </h2>
            {!isEditing && (
              <p className="text-xs text-slate-500 mt-0.5">
                ค่าธรรมเนียมโครงการจะถูกเติมอัตโนมัติตามกลุ่มที่เลือก กรอกเพิ่มแค่ค่าจ้าง วันที่ และตั๋วเครื่องบิน
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
                <button onClick={() => setMode("quick")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors ${mode === "quick" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                  <Zap className="w-3 h-3" /> เพิ่มเร็ว
                </button>
                <button onClick={() => setMode("detailed")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors ${mode === "detailed" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                  <Settings className="w-3 h-3" /> แบบละเอียด
                </button>
              </div>
            )}
            <button onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isEditing && mode === "quick" ? (
          <QuickAddForm
            onSave={onSave}
            onClose={onClose}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
          />
        ) : (
          <DetailedForm
            onSave={onSave}
            onClose={onClose}
            initialJob={initialJob}
            defaultStartDate={defaultStartDate}
            defaultEndDate={defaultEndDate}
          />
        )}
      </div>
    </div>
  );
}
