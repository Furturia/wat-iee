import React from "react";
import {
  Calendar,
  Filter,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Coins,
} from "lucide-react";
import { AppSettings, SortMetric } from "@/types";
import { calculateDateDuration } from "@/lib/calculations";

interface GlobalControlsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onAddNewJob: () => void;
  onLoadDemoJobs: () => void;
  onLoadIEEJobs?: () => void;
  onOpenExportImport: () => void;
  totalJobsCount: number;
  visibleJobsCount: number;
  fullJobsCount: number;
  sortMetric: SortMetric;
  onSortChange: (metric: SortMetric) => void;
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
}

export function GlobalControls({
  settings,
  onUpdateSettings,
  onAddNewJob,
  onLoadDemoJobs,
  onLoadIEEJobs,
  onOpenExportImport,
  totalJobsCount,
  visibleJobsCount,
  fullJobsCount,
  sortMetric,
  onSortChange,
  viewMode,
  onViewModeChange,
}: GlobalControlsProps) {
  const globalDuration = calculateDateDuration(
    settings.globalStartDate,
    settings.globalEndDate
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
      {/* Top row: Primary Dates & Trip Timeline Customizer */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50/60 p-3.5 rounded-lg border border-sky-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-700" />
            <span className="font-semibold text-sm text-slate-800">
              กำหนดช่วงวันที่คาดว่าจะเริ่ม - จบงานของคุณ (Custom Employment Dates)
            </span>
          </div>
          <p className="text-xs text-slate-600">
            ระบบจะคำนวณจำนวนวัน สัปดาห์ ค่าใช้จ่าย และรายได้ใหม่ตามช่วงเวลาที่คุณระบุแบบเรียลไทม์
          </p>
        </div>

        {/* Date Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs shadow-xs">
            <label htmlFor="global-start" className="text-slate-500 font-medium">เริ่ม:</label>
            <input
              id="global-start"
              type="date"
              value={settings.globalStartDate || ""}
              onChange={(e) => onUpdateSettings({ globalStartDate: e.target.value })}
              className="font-medium text-slate-800 outline-none text-xs bg-transparent"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs shadow-xs">
            <label htmlFor="global-end" className="text-slate-500 font-medium">จบ:</label>
            <input
              id="global-end"
              type="date"
              value={settings.globalEndDate || ""}
              onChange={(e) => onUpdateSettings({ globalEndDate: e.target.value })}
              className="font-medium text-slate-800 outline-none text-xs bg-transparent"
            />
          </div>

          {/* Duration badge */}
          {globalDuration.isValid && (
            <div className="bg-sky-600 text-white font-semibold text-xs px-2.5 py-1.5 rounded-md shadow-xs">
              {globalDuration.days} วัน ({Math.round(globalDuration.weeks * 10) / 10} สัปดาห์)
            </div>
          )}

          {/* Toggle apply to all */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none ml-1">
            <input
              type="checkbox"
              checked={!!settings.applyGlobalDatesToAll}
              onChange={(e) =>
                onUpdateSettings({ applyGlobalDatesToAll: e.target.checked })
              }
              className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
            />
            <span className="font-medium">ใช้วันที่นี้กับทุกงาน</span>
          </label>
        </div>
      </div>

      {/* Middle row: Sorting, Availability Filter, Currency & Exchange Rate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">เรียงลำดับ:</span>
            <select
              value={sortMetric}
              onChange={(e) => onSortChange(e.target.value as SortMetric)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none hover:border-slate-400 focus:border-sky-500"
            >
              <option value="break_even_asc">⚡ คืนทุนเร็วที่สุด (ชม. คืนทุนต่ำสุด)</option>
              <option value="net_return_desc">💰 เงินเหลือสุทธิสูงสุด (กำไรคาดการณ์)</option>
              <option value="second_job_desc">💼 โอกาสหางานที่สองสูงสุด (Second Job)</option>
              <option value="wage_desc">💵 ค่าจ้างรายชั่วโมงสูงสุด (Hourly Wage)</option>
              <option value="upfront_cash_asc">🛫 เงินสดที่ต้องเตรียมไปน้อยสุด</option>
            </select>
          </div>

          {/* Hide full jobs toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors">
            {settings.hideFullJobsByDefault ? (
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-sky-600" />
            )}
            <input
              type="checkbox"
              checked={settings.hideFullJobsByDefault}
              onChange={(e) =>
                onUpdateSettings({ hideFullJobsByDefault: e.target.checked })
              }
              className="sr-only"
            />
            <span className="font-medium">
              ซ่อนงานที่เต็มแล้ว
              {fullJobsCount > 0 && ` (${fullJobsCount})`}
            </span>
          </label>

          {/* View mode toggle (Cards / Table) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-xs font-medium text-slate-600 border border-slate-200">
            <button
              onClick={() => onViewModeChange("cards")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              การ์ดเทียบงาน
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              ตารางเปรียบเทียบ
            </button>
          </div>
        </div>

        {/* Currency & Exchange Rate */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>อัตราแลกเปลี่ยน:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-medium text-slate-700">
            <span>$1 =</span>
            <input
              type="number"
              step="0.5"
              min="20"
              max="50"
              value={settings.exchangeRateTHBPerUSD}
              onChange={(e) =>
                onUpdateSettings({
                  exchangeRateTHBPerUSD: parseFloat(e.target.value) || 35,
                })
              }
              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-semibold text-slate-800 outline-none focus:border-sky-500"
            />
            <span>บาท</span>
          </div>

          <select
            value={settings.currencyDisplay}
            onChange={(e) =>
              onUpdateSettings({
                currencyDisplay: e.target.value as "USD" | "THB" | "both",
              })
            }
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="both">แสดงทั้ง USD & บาท</option>
            <option value="THB">แสดงเฉพาะบาท (THB)</option>
            <option value="USD">แสดงเฉพาะ USD ($)</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Add job & data management buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          แสดง <span className="font-semibold text-slate-800">{visibleJobsCount}</span> จากทั้งหมด{" "}
          <span className="font-semibold text-slate-800">{totalJobsCount}</span> ตำแหน่งงาน
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onLoadIEEJobs && (
            <button
              onClick={onLoadIEEJobs}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors"
              title="โหลดงานจริงทั้งหมดจาก IEE Thailand พร้อมคำนวณจุดคืนทุนและจัดอันดับทันที"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              <span>โหลดงานจริง IEE</span>
            </button>
          )}

          <button
            onClick={onAddNewJob}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มข้อเสนองานใหม่</span>
          </button>

          <button
            onClick={onLoadDemoJobs}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors"
            title="โหลดตัวอย่างงานจำลอง (Fictional Demo Jobs) ของ IEE"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>ตัวอย่างจำลอง</span>
          </button>

          <button
            onClick={onOpenExportImport}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-2 rounded-lg border border-slate-300 transition-colors"
            title="สำรองข้อมูลเป็นไฟล์ JSON หรือนำเข้าข้อมูลที่บันทึกไว้"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออก / นำเข้า</span>
          </button>
        </div>
      </div>
    </div>
  );
}

