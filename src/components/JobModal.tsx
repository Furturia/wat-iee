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
  AlertCircle,
} from "lucide-react";
import {
  AvailabilityStatus,
  JobGroupType,
  JobOffer,
  MoneyInput,
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
  const [hourlyWage, setHourlyWage] = useState("");
  const [expectedHours, setExpectedHours] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate || "2027-06-01");
  const [endDate, setEndDate] = useState(defaultEndDate || "2027-08-25");
  const [airfareTHB, setAirfareTHB] = useState("");
  const [housingUSD, setHousingUSD] = useState("");
  const [foodUSD, setFoodUSD] = useState("");
  const [citySafetyNotes, setCitySafetyNotes] = useState("");
  const [secondJobFeasibility, setSecondJobFeasibility] = useState<SecondJobFeasibility>("medium");
  const [extraHours, setExtraHours] = useState("");
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus>("open");
  const [errors, setErrors] = useState<string[]>([]);

  const duration = calculateDateDuration(startDate, endDate);
  const feeDetails = feeConfig.groupTypes[groupType === "other" ? "ultimate" : groupType];

  const handleQuickSave = () => {
    const errs: string[] = [];
    if (!jobTitle.trim()) errs.push("ชื่อตำแหน่งงาน");
    if (!employerName.trim()) errs.push("ชื่อนายจ้าง");
    if (!city.trim()) errs.push("เมือง");
    if (!state.trim()) errs.push("รัฐ");
    if (errs.length > 0) { setErrors(errs); return; }

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

    const parsedWage = hourlyWage ? parseFloat(hourlyWage) : undefined;
    const parsedHours = expectedHours ? parseFloat(expectedHours) : undefined;

    const weeklyCosts: WeeklyCostInput[] = [];
    if (housingUSD) {
      weeklyCosts.push({
        id: "housing",
        label: "ค่าที่พัก (Housing)",
        currency: "USD",
        amount: parseFloat(housingUSD),
        category: "housing",
      });
    }
    if (foodUSD) {
      weeklyCosts.push({
        id: "food",
        label: "ค่าอาหาร (Food)",
        currency: "USD",
        amount: parseFloat(foodUSD),
        category: "food",
      });
    }

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
      hourlyWageUSD: parsedWage,
      expectedHoursPerWeek: parsedHours,
      lowHoursPerWeek: parsedHours ? Math.max(15, parsedHours - 8) : undefined,
      highHoursPerWeek: parsedHours ? parsedHours + 8 : undefined,
      estimatedDeductionRate: 0.10,
      citySafetyNotes: citySafetyNotes.trim() || undefined,
      secondJobInfo: {
        feasibility: secondJobFeasibility,
        potentialExtraHoursPerWeek: extraHours ? parseFloat(extraHours) : undefined,
      },
      oneTimeCosts: costsWithAirfare,
      weeklyCosts,
      refundableDepositsUSD: undefined,
      emergencyReserveUSD: undefined,
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
            <label className="block font-semibold text-slate-700 mb-1">ชื่อตำแหน่งงาน *</label>
            <input type="text" required placeholder="เช่น Lifeguard, Server Assistant"
              value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อนายจ้าง / บริษัท *</label>
            <input type="text" required placeholder="เช่น Harrah's Resort, Cedar Point"
              value={employerName} onChange={(e) => setEmployerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เมือง (City) *</label>
            <input type="text" required placeholder="เช่น Atlantic City, Sandusky"
              value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">รัฐ (State) *</label>
            <input type="text" required placeholder="เช่น NJ, OH, NV"
              value={state} onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
        </div>
      </div>

      {/* Group Type Selector */}
      <div className="text-xs space-y-1.5">
        <label className="block font-semibold text-slate-700">กลุ่มงาน IEE (มีผลต่อโครงสร้างค่าธรรมเนียมและสิทธิ์โปรฯ)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["classic", "signature", "exclusive", "ultimate"] as const).map((g) => {
            const isSel = groupType === g;
            return (
              <button key={g} type="button" onClick={() => setGroupType(g)}
                className={`p-2.5 rounded-lg border text-left transition-all ${isSel ? "border-sky-500 bg-sky-50/70 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className={`font-bold capitalize ${isSel ? "text-sky-800" : "text-slate-800"}`}>IEE {g}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {feeConfig.groupTypes[g]?.knownFixedFeeSubtotalTHB?.toLocaleString()} ฿ + $185
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">วันเริ่มงาน</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium text-slate-800" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">วันสิ้นสุดงาน</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium text-slate-800" />
        </div>
      </div>
      {duration.isValid && (
        <div className="text-[11px] text-sky-700 font-medium bg-sky-50 px-3 py-1.5 rounded-md border border-sky-100 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>ระยะเวลา: <strong>{duration.days} วัน</strong> ({Math.round(duration.weeks * 10) / 10} สัปดาห์)</span>
        </div>
      )}

      {/* Wage & Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">ค่าจ้างต่อชั่วโมง ($/ชม.)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input type="number" step="0.25" min="5" max="100" placeholder="เช่น 16.50"
              value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 outline-none focus:border-sky-500 font-bold text-slate-800 text-base" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">ชั่วโมงต่อสัปดาห์ที่คาดไว้</label>
          <input type="number" step="1" min="15" max="80" placeholder="เช่น 35"
            value={expectedHours} onChange={(e) => setExpectedHours(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-bold text-slate-800" />
        </div>
      </div>

      {/* Costs (only the variables not in config) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            ค่าตั๋วเครื่องบินไป-กลับ (บาท)
          </label>
          <input type="number" step="1000" placeholder="เช่น 36000 (ยังไม่รู้เว้นว่าง)"
            value={airfareTHB} onChange={(e) => setAirfareTHB(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold text-slate-800" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">ค่าที่พักต่อสัปดาห์ ($/สัปดาห์)</label>
          <input type="number" step="5" placeholder="เช่น 95, 120 (เว้นว่างได้)"
            value={housingUSD} onChange={(e) => setHousingUSD(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold text-slate-800" />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">ค่าอาหารต่อสัปดาห์ ($/สัปดาห์)</label>
          <input type="number" step="5" placeholder="เช่น 75, 100 (เว้นว่างได้)"
            value={foodUSD} onChange={(e) => setFoodUSD(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold text-slate-800" />
        </div>
      </div>

      {/* Safety & Second Job */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            บันทึกความปลอดภัยของเมือง
          </div>
          <textarea
            rows={2}
            value={citySafetyNotes}
            onChange={(e) => setCitySafetyNotes(e.target.value)}
            placeholder="เช่น พื้นที่โรงแรมปลอดภัย มี รปภ. 24 ชม. แต่ควรเลี่ยงซอยเปลี่ยว..."
            className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs outline-none focus:border-sky-500 resize-none"
          />
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
// DETAILED ADD/EDIT MODE (full form)
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
  const [hourlyWageUSD, setHourlyWageUSD] = useState(initialJob?.hourlyWageUSD !== undefined ? String(initialJob.hourlyWageUSD) : "");
  const [expectedHours, setExpectedHours] = useState(initialJob?.expectedHoursPerWeek !== undefined ? String(initialJob.expectedHoursPerWeek) : "");
  const [lowHours, setLowHours] = useState(initialJob?.lowHoursPerWeek !== undefined ? String(initialJob.lowHoursPerWeek) : "");
  const [highHours, setHighHours] = useState(initialJob?.highHoursPerWeek !== undefined ? String(initialJob.highHoursPerWeek) : "");
  const [citySafetyNotes, setCitySafetyNotes] = useState(initialJob?.citySafetyNotes || "");
  const [secondJobFeasibility, setSecondJobFeasibility] = useState<SecondJobFeasibility>(initialJob?.secondJobInfo?.feasibility || "medium");
  const [secondJobNotes, setSecondJobNotes] = useState(initialJob?.secondJobInfo?.notes || "");
  const [extraHours, setExtraHours] = useState(initialJob?.secondJobInfo?.potentialExtraHoursPerWeek !== undefined ? String(initialJob.secondJobInfo.potentialExtraHoursPerWeek) : "");
  const [oneTimeCosts, setOneTimeCosts] = useState<MoneyInput[]>(
    initialJob?.oneTimeCosts?.length ? initialJob.oneTimeCosts : getIEEGroupDefaultCosts("ultimate")
  );
  const [weeklyCosts, setWeeklyCosts] = useState<WeeklyCostInput[]>(
    initialJob?.weeklyCosts?.length ? initialJob.weeklyCosts : []
  );
  const [depositsUSD, setDepositsUSD] = useState(initialJob?.refundableDepositsUSD !== undefined ? String(initialJob.refundableDepositsUSD) : "");
  const [reserveUSD, setReserveUSD] = useState(initialJob?.emergencyReserveUSD !== undefined ? String(initialJob.emergencyReserveUSD) : "");
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
      hourlyWageUSD: isNaN(wage) || !hourlyWageUSD ? undefined : wage,
      expectedHoursPerWeek: isNaN(expHours) || !expectedHours ? undefined : expHours,
      lowHoursPerWeek: lowHours ? parseFloat(lowHours) : undefined,
      highHoursPerWeek: highHours ? parseFloat(highHours) : undefined,
      citySafetyNotes: citySafetyNotes.trim() || undefined,
      secondJobInfo: {
        feasibility: secondJobFeasibility,
        notes: secondJobNotes || undefined,
        potentialExtraHoursPerWeek: extraHours ? parseFloat(extraHours) : undefined,
      },
      oneTimeCosts,
      weeklyCosts,
      refundableDepositsUSD: depositsUSD !== "" && !isNaN(parseFloat(depositsUSD)) ? parseFloat(depositsUSD) : undefined,
      emergencyReserveUSD: reserveUSD !== "" && !isNaN(parseFloat(reserveUSD)) ? parseFloat(reserveUSD) : undefined,
      estimatedDeductionRate: deductionRate ? parseFloat(deductionRate) / 100 : 0.10,
      notes: notes.trim() || undefined,
      isDemo: false,
      createdAt: initialJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(job);
    onClose();
  };

  return (
    <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-xs">
      {/* Basic Job Details */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-sky-600" />
          1. ข้อมูลตำแหน่งงานและนายจ้าง
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อตำแหน่งงาน *</label>
            <input type="text" required placeholder="เช่น Server, Lifeguard" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อนายจ้าง / สถานประกอบการ *</label>
            <input type="text" required placeholder="เช่น Harrah's Hotel" value={employerName} onChange={(e) => setEmployerName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เมือง (City) *</label>
            <input type="text" required placeholder="เช่น Atlantic City" value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">รัฐ (State) *</label>
            <input type="text" required placeholder="เช่น NJ" value={state} onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">กลุ่มงาน IEE</label>
            <select value={jobGroupType} onChange={(e) => handleApplyIEEGroupDefaults(e.target.value as JobGroupType)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 bg-white font-medium">
              <option value="classic">Classic</option>
              <option value="signature">Signature</option>
              <option value="exclusive">Exclusive</option>
              <option value="ultimate">Ultimate</option>
              <option value="other">อื่น ๆ</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">สถานะรับสมัคร</label>
            <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 bg-white font-medium">
              <option value="open">เปิดรับสมัคร</option>
              <option value="limited">ใกล้เต็ม/จำกัด</option>
              <option value="full">เต็มแล้ว (ปิดรับ)</option>
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
          2. วันเริ่มและสิ้นสุดสัญญาจ้างงาน
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">วันเริ่มงาน (Start Date)</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">วันสิ้นสุดงาน (End Date)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-medium" />
          </div>
        </div>
        {duration.isValid && (
          <div className="text-[11px] text-sky-700 font-medium bg-sky-50 px-3 py-1.5 rounded-md border border-sky-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>คำนวณได้: <strong>{duration.days} วัน</strong> ({Math.round(duration.weeks * 10) / 10} สัปดาห์)</span>
          </div>
        )}
      </section>

      {/* Wages and Hours */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-sky-600" />
          3. ค่าจ้างและชั่วโมงทำงาน
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">ค่าจ้างต่อชั่วโมง ($/ชม.)</label>
            <input type="number" step="0.25" min="5" max="100" placeholder="เช่น 16.50" value={hourlyWageUSD} onChange={(e) => setHourlyWageUSD(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-bold text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชม./สัปดาห์ (คาดการณ์)</label>
            <input type="number" step="1" min="10" max="80" placeholder="เช่น 35" value={expectedHours} onChange={(e) => setExpectedHours(e.target.value)}
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
            <label className="block font-semibold text-slate-700">บันทึกความปลอดภัยของเมือง</label>
            <textarea
              rows={3}
              value={citySafetyNotes}
              onChange={(e) => setCitySafetyNotes(e.target.value)}
              placeholder="บันทึกสภาพแวดล้อม ความปลอดภัย หรือข้อควรระวังในพื้นที่..."
              className="w-full border border-slate-300 rounded-md p-2 text-xs outline-none focus:border-sky-500 resize-none"
            />
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
            <input type="number" placeholder="เว้นว่างได้" value={depositsUSD} onChange={(e) => setDepositsUSD(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-sky-500 font-semibold" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">เงินสำรอง (USD)</label>
            <input type="number" placeholder="เว้นว่างได้" value={reserveUSD} onChange={(e) => setReserveUSD(e.target.value)}
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
// MAIN MODAL
// =========================================================
export function JobModal({
  isOpen,
  onClose,
  onSave,
  initialJob,
  defaultStartDate,
  defaultEndDate,
}: JobModalProps) {
  const [mode, setMode] = useState<"quick" | "detailed">(
    initialJob ? "detailed" : "quick"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {initialJob ? "แก้ไขข้อเสนองาน" : "เพิ่มข้อเสนองานใหม่"}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === "quick"
                ? "โหมดเพิ่มด่วน: ดึงค่าธรรมเนียมคงที่ตามกลุ่มงาน IEE อัตโนมัติ"
                : "โหมดละเอียด: ปรับแต่งรายการค่าใช้จ่ายทุกตัวและสถานการณ์ได้อย่างอิสระ"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!initialJob && (
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    mode === "quick"
                      ? "bg-white text-sky-800 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  เพิ่มด่วน
                </button>
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    mode === "detailed"
                      ? "bg-white text-sky-800 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Settings className="w-3 h-3 text-slate-500" />
                  ละเอียด
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        {mode === "quick" && !initialJob ? (
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
