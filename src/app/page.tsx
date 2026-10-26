"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { GlobalControls } from "@/components/GlobalControls";
import { JobCard } from "@/components/JobCard";
import { JobTableView } from "@/components/JobTableView";
import { JobModal } from "@/components/JobModal";
import { JobDetailModal } from "@/components/JobDetailModal";
import { FeeRulesModal } from "@/components/FeeRulesModal";
import { ExportImportModal } from "@/components/ExportImportModal";
import { IEEJobsBrowser } from "@/components/IEEJobsBrowser";
import { AppDataV1, AppSettings, CalculationEvaluation, JobOffer, SortMetric } from "@/types";
import { SAMPLE_JOBS } from "@/lib/sample-data";
import { IEE_REAL_JOBS } from "@/lib/iee-real-jobs";
import { evaluateJobOffer } from "@/lib/calculations";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Wallet,
  Sparkles,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

const STORAGE_KEY = "wat_worth_it_app_data_v1";

const DEFAULT_SETTINGS: AppSettings = {
  hideFullJobsByDefault: true,
  currencyDisplay: "both",
  exchangeRateTHBPerUSD: 35,
  exchangeRateDate: "2026-10-25",
  locale: "th-TH",
  globalStartDate: "2027-06-01",
  globalEndDate: "2027-08-25",
  applyGlobalDatesToAll: true,
};

export default function HomePage() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sortMetric, setSortMetric] = useState<SortMetric>("break_even_asc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobOffer | null>(null);

  const [isFeeRulesOpen, setIsFeeRulesOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AppDataV1 = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.jobs)) {
          // If stored data contains only old fictional demo jobs, automatically upgrade to real IEE jobs
          const hasOnlyFictionalDemo =
            parsed.jobs.length > 0 &&
            parsed.jobs.every((j) => j.id.startsWith("fictional-job-"));

          if (!hasOnlyFictionalDemo && parsed.jobs.length > 0) {
            setJobs(parsed.jobs);
            if (parsed.settings) {
              setSettings((prev) => ({
                ...prev,
                ...parsed.settings,
                applyGlobalDatesToAll: parsed.settings.applyGlobalDatesToAll ?? true,
              }));
            }
            setIsLoaded(true);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to IEE real jobs", e);
    }
    // Default to actual IEE Thailand jobs
    setJobs(IEE_REAL_JOBS);
    setIsLoaded(true);
  }, []);

  // Save to localStorage when jobs or settings change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave: AppDataV1 = {
        schemaVersion: 1,
        settings,
        jobs,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Could not persist to localStorage", e);
    }
  }, [jobs, settings, isLoaded]);

  // Evaluate all jobs
  const evaluations: Record<string, CalculationEvaluation> = useMemo(() => {
    const map: Record<string, CalculationEvaluation> = {};
    for (const job of jobs) {
      map[job.id] = evaluateJobOffer(job, settings);
    }
    return map;
  }, [jobs, settings]);

  // Availability counts
  const fullJobsCount = useMemo(() => {
    return jobs.filter((j) => j.availabilityStatus === "full").length;
  }, [jobs]);

  // Filtered and sorted jobs
  const visibleJobs = useMemo(() => {
    let list = [...jobs];

    // Filter full jobs if enabled
    if (settings.hideFullJobsByDefault) {
      list = list.filter((j) => j.availabilityStatus !== "full");
    }

    // Sort
    list.sort((a, b) => {
      const evalA = evaluations[a.id];
      const evalB = evaluations[b.id];

      switch (sortMetric) {
        case "break_even_asc": {
          // Lowest break-even hours first; jobs without break-even go to end
          const beA = evalA?.breakEvenHoursPerWeek ?? 9999;
          const beB = evalB?.breakEvenHoursPerWeek ?? 9999;
          return beA - beB;
        }
        case "net_return_desc": {
          const retA = evalA?.netReturnUSD ?? -999999;
          const retB = evalB?.netReturnUSD ?? -999999;
          return retB - retA;
        }
        case "wage_desc": {
          return (b.hourlyWageUSD ?? 0) - (a.hourlyWageUSD ?? 0);
        }
        case "upfront_cash_asc": {
          const upA = evalA?.upfrontCashUSD ?? 999999;
          const upB = evalB?.upfrontCashUSD ?? 999999;
          return upA - upB;
        }
        case "safety_desc": {
          const scoreMap: Record<string, number> = {
            safe: 4,
            moderate: 3,
            caution: 2,
            unknown: 1,
          };
          const scoreA =
            (a.safetyAssessment?.score ?? 0) +
            (scoreMap[a.safetyAssessment?.level || "unknown"] || 0) * 10;
          const scoreB =
            (b.safetyAssessment?.score ?? 0) +
            (scoreMap[b.safetyAssessment?.level || "unknown"] || 0) * 10;
          return scoreB - scoreA;
        }
        case "second_job_desc": {
          const secMap: Record<string, number> = {
            high: 4,
            medium: 3,
            low: 2,
            prohibited: 1,
            unknown: 0,
          };
          const valA =
            (secMap[a.secondJobInfo?.feasibility || "unknown"] || 0) * 10 +
            (a.secondJobInfo?.potentialExtraHoursPerWeek ?? 0);
          const valB =
            (secMap[b.secondJobInfo?.feasibility || "unknown"] || 0) * 10 +
            (b.secondJobInfo?.potentialExtraHoursPerWeek ?? 0);
          return valB - valA;
        }
        default:
          return 0;
      }
    });

    return list;
  }, [jobs, settings.hideFullJobsByDefault, sortMetric, evaluations]);

  // Overall summary metrics
  const summaryMetrics = useMemo(() => {
    if (visibleJobs.length === 0) return null;

    let minBreakEven: number | undefined = undefined;
    let maxNetReturn: number | undefined = undefined;
    let minUpfront: number | undefined = undefined;

    for (const job of visibleJobs) {
      const ev = evaluations[job.id];
      if (!ev) continue;

      if (ev.breakEvenHoursPerWeek !== undefined) {
        if (minBreakEven === undefined || ev.breakEvenHoursPerWeek < minBreakEven) {
          minBreakEven = ev.breakEvenHoursPerWeek;
        }
      }

      if (ev.netReturnUSD !== undefined) {
        if (maxNetReturn === undefined || ev.netReturnUSD > maxNetReturn) {
          maxNetReturn = ev.netReturnUSD;
        }
      }

      if (ev.upfrontCashUSD > 0) {
        if (minUpfront === undefined || ev.upfrontCashUSD < minUpfront) {
          minUpfront = ev.upfrontCashUSD;
        }
      }
    }

    return { minBreakEven, maxNetReturn, minUpfront };
  }, [visibleJobs, evaluations]);

  // Job actions
  const handleAddNewJob = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: JobOffer) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleDuplicateJob = (job: JobOffer) => {
    const dup: JobOffer = {
      ...job,
      id: `job-${Date.now()}`,
      jobTitle: `${job.jobTitle} (สำเนา)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs([dup, ...jobs]);
  };

  const handleDeleteJob = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อเสนองานนี้?")) {
      setJobs(jobs.filter((j) => j.id !== id));
    }
  };

  const handleSaveJob = (jobToSave: JobOffer) => {
    const exists = jobs.some((j) => j.id === jobToSave.id);
    if (exists) {
      setJobs(jobs.map((j) => (j.id === jobToSave.id ? jobToSave : j)));
    } else {
      setJobs([jobToSave, ...jobs]);
    }
  };

  const handleAddIEEJob = (jobToAdd: JobOffer) => {
    setJobs((currentJobs) => {
      const alreadyAdded = currentJobs.some(
        (job) =>
          job.source?.sourceUrl === jobToAdd.source?.sourceUrl &&
          job.jobTitle === jobToAdd.jobTitle
      );
      return alreadyAdded ? currentJobs : [jobToAdd, ...currentJobs];
    });
  };

  const handleLoadIEEJobs = () => {
    setJobs(IEE_REAL_JOBS);
    setToast({
      message: `โหลดงานจริงจาก IEE Thailand (${IEE_REAL_JOBS.length} ตำแหน่ง) พร้อมคำนวณเรียบร้อยแล้ว ✓`,
      type: "success",
    });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLoadDemoJobs = () => {
    if (confirm("ต้องการโหลดชุดข้อมูลตัวอย่างจำลอง (Fictional Demo Jobs) ของ IEE หรือไม่?")) {
      setJobs(SAMPLE_JOBS);
      setToast({
        message: "โหลดชุดข้อมูลตัวอย่างจำลอง (Demo) แล้ว",
        type: "info",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImportSuccess = (importedData: AppDataV1) => {
    setJobs(importedData.jobs);
    if (importedData.settings) {
      setSettings((prev) => ({ ...prev, ...importedData.settings }));
    }
  };

  const handleViewDetails = (job: JobOffer) => {
    setSelectedJobForDetail(job);
    setIsDetailModalOpen(true);
  };

  const isDemoActive = jobs.some((j) => j.isDemo);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* App Header */}
      <Header
        onOpenFeeRules={() => setIsFeeRulesOpen(true)}
        isDemoActive={isDemoActive}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Global Controls & Filters */}
        <GlobalControls
          settings={settings}
          onUpdateSettings={(newSettings) =>
            setSettings((prev) => ({ ...prev, ...newSettings }))
          }
          onAddNewJob={handleAddNewJob}
          onLoadIEEJobs={handleLoadIEEJobs}
          onLoadDemoJobs={handleLoadDemoJobs}
          onOpenExportImport={() => setIsExportImportOpen(true)}
          totalJobsCount={jobs.length}
          visibleJobsCount={visibleJobs.length}
          fullJobsCount={fullJobsCount}
          sortMetric={sortMetric}
          onSortChange={setSortMetric}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <IEEJobsBrowser
          existingJobs={jobs}
          onAddToComparison={handleAddIEEJob}
        />

        {/* Summary Metric Strip */}
        {summaryMetrics && visibleJobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  จุดคืนทุนเร็วที่สุดในรายการ
                </div>
                <div className="text-base font-bold text-slate-900">
                  {summaryMetrics.minBreakEven !== undefined
                    ? `${summaryMetrics.minBreakEven} ชม./สัปดาห์`
                    : "ข้อมูลไม่ครบ"}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  เงินเหลือสุทธิสูงสุด (ประมาณการ)
                </div>
                <div className="text-base font-bold text-emerald-700">
                  {summaryMetrics.maxNetReturn !== undefined
                    ? formatCurrency(summaryMetrics.maxNetReturn, "USD")
                    : "-"}
                  {summaryMetrics.maxNetReturn !== undefined && (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      (≈ {formatCurrency(summaryMetrics.maxNetReturn * settings.exchangeRateTHBPerUSD, "THB")})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  เงินสดก่อนเดินทางต่ำสุด
                </div>
                <div className="text-base font-bold text-slate-900">
                  {summaryMetrics.minUpfront !== undefined
                    ? formatCurrency(summaryMetrics.minUpfront, "USD")
                    : "-"}
                  {summaryMetrics.minUpfront !== undefined && (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      (≈ {formatCurrency(summaryMetrics.minUpfront * settings.exchangeRateTHBPerUSD, "THB")})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Content: Cards or Table */}
        {visibleJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ไม่พบข้อเสนองานที่ตรงกับตัวกรอง
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {jobs.length > 0
                  ? "งานทั้งหมดอาจถูกซ่อนอยู่เนื่องจากมีสถานะ 'เต็มแล้ว' ลองปิดตัวกรอง 'ซ่อนงานที่เต็มแล้ว' หรือเพิ่มงานใหม่"
                  : "ยังไม่มีงานในรายการ เริ่มต้นด้วยการเพิ่มงานใหม่หรือโหลดตัวอย่างงานของ IEE"}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleLoadIEEJobs}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>โหลดงานจริงจาก IEE</span>
              </button>
              <button
                onClick={handleAddNewJob}
                className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มงานด้วยตนเอง</span>
              </button>
            </div>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleJobs.map((job, idx) => (
              <JobCard
                key={job.id}
                job={job}
                evaluation={evaluations[job.id]}
                settings={settings}
                rank={idx + 1}
                rankMetric={
                  sortMetric === "break_even_asc" ? "คืนทุนเร็ว" :
                  sortMetric === "net_return_desc" ? "กำไรสูง" :
                  sortMetric === "safety_desc" ? "ปลอดภัย" :
                  sortMetric === "second_job_desc" ? "งาน2" :
                  sortMetric === "wage_desc" ? "ค่าจ้างสูง" :
                  sortMetric === "upfront_cash_asc" ? "เตรียมเงินน้อย" : ""
                }
                onEdit={handleEditJob}
                onDuplicate={handleDuplicateJob}
                onDelete={handleDeleteJob}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <JobTableView
            jobs={visibleJobs}
            evaluations={evaluations}
            settings={settings}
            rankMetric={
              sortMetric === "break_even_asc" ? "คืนทุนเร็ว" :
              sortMetric === "net_return_desc" ? "กำไรสูง" :
              sortMetric === "safety_desc" ? "ปลอดภัย" :
              sortMetric === "second_job_desc" ? "งาน2" :
              sortMetric === "wage_desc" ? "ค่าจ้างสูง" :
              sortMetric === "upfront_cash_asc" ? "เตรียมเงินน้อย" : ""
            }
            onEdit={handleEditJob}
            onDuplicate={handleDuplicateJob}
            onDelete={handleDeleteJob}
            onViewDetails={handleViewDetails}
          />
        )}
      </main>

      {/* Modals */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        initialJob={editingJob}
        defaultStartDate={settings.globalStartDate}
        defaultEndDate={settings.globalEndDate}
      />

      <JobDetailModal
        job={selectedJobForDetail}
        evaluation={selectedJobForDetail ? evaluations[selectedJobForDetail.id] : null}
        settings={settings}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <FeeRulesModal
        isOpen={isFeeRulesOpen}
        onClose={() => setIsFeeRulesOpen(false)}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        jobs={jobs}
        settings={settings}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
