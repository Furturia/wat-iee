import React, { useState } from "react";
import { X, Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppDataV1, AppSettings, JobOffer } from "@/types";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobOffer[];
  settings: AppSettings;
  onImportSuccess: (data: AppDataV1) => void;
}

export function validateImportedJobs(jobs: any[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(jobs)) {
    return { isValid: false, error: "โครงสร้างข้อมูลผิดพลาด: ข้อมูล jobs ต้องเป็น Array" };
  }
  if (jobs.length === 0) {
    return { isValid: false, error: "ไม่พบรายการงานในไฟล์ที่นำเข้า" };
  }

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const prefix = `รายการที่ ${i + 1}`;
    if (!job || typeof job !== "object") {
      return { isValid: false, error: `${prefix}: ข้อมูลไม่ถูกต้อง (ไม่ใช่ Object)` };
    }
    if (!job.id || typeof job.id !== "string") {
      return { isValid: false, error: `${prefix}: ขาดรหัส id หรือรูปแบบ id ไม่ถูกต้อง` };
    }
    if (!job.employerName || typeof job.employerName !== "string") {
      return { isValid: false, error: `${prefix} (${job.id}): ขาดชื่อนายจ้าง (employerName)` };
    }
    if (!job.jobTitle || typeof job.jobTitle !== "string") {
      return { isValid: false, error: `${prefix} (${job.id}): ขาดชื่อตำแหน่งงาน (jobTitle)` };
    }
    if (!job.jobGroupType || typeof job.jobGroupType !== "string") {
      return { isValid: false, error: `${prefix} (${job.id}): ขาดกลุ่มงาน (jobGroupType)` };
    }
    if (!job.availabilityStatus || typeof job.availabilityStatus !== "string") {
      return { isValid: false, error: `${prefix} (${job.id}): ขาดสถานะการรับสมัคร (availabilityStatus)` };
    }
    if (!Array.isArray(job.oneTimeCosts)) {
      return { isValid: false, error: `${prefix} (${job.id}): ค่าใช้จ่ายก้อนเดียว (oneTimeCosts) ต้องเป็น Array` };
    }
    if (!Array.isArray(job.weeklyCosts)) {
      return { isValid: false, error: `${prefix} (${job.id}): ค่าใช้จ่ายรายสัปดาห์ (weeklyCosts) ต้องเป็น Array` };
    }
  }

  return { isValid: true };
}

export function ExportImportModal({
  isOpen,
  onClose,
  jobs,
  settings,
  onImportSuccess,
}: ExportImportModalProps) {
  if (!isOpen) return null;

  const [importJson, setImportJson] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const exportData: AppDataV1 = {
    schemaVersion: 1,
    settings,
    jobs,
  };

  const handleDownload = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `wat-worth-it-data-${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!importJson.trim()) {
      setErrorMsg("กรุณาวางโค้ด JSON เพื่อนำเข้า");
      return;
    }

    try {
      const parsed = JSON.parse(importJson);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("ไฟล์ JSON ไม่ถูกต้อง");
      }

      if (!Array.isArray(parsed.jobs)) {
        throw new Error("โครงสร้างข้อมูลผิดพลาด: ไม่พบรายการ jobs");
      }

      const validation = validateImportedJobs(parsed.jobs);
      if (!validation.isValid) {
        throw new Error(validation.error || "ข้อมูลรายการงานไม่ถูกต้องตาม Schema");
      }

      const importedData: AppDataV1 = {
        schemaVersion: parsed.schemaVersion || 1,
        settings: {
          ...settings,
          ...(parsed.settings || {}),
        },
        jobs: parsed.jobs,
      };

      onImportSuccess(importedData);
      setSuccessMsg(`นำเข้าข้อมูลสำเร็จ ${parsed.jobs.length} รายการ`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(`เกิดข้อผิดพลาดในการนำเข้า: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ส่งออกและนำเข้าข้อมูล (Export / Import JSON)
            </h2>
            <p className="text-xs text-slate-500">
              สำรองข้อมูลรายการงานและการตั้งค่าทั้งหมดเก็บไว้ในเครื่อง
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Download className="w-4 h-4 text-sky-600" />
              <span>ดาวน์โหลดไฟล์ข้อมูล (Export)</span>
            </div>
            <p className="text-slate-600">
              บันทึกข้อเสนองานทั้งหมด {jobs.length} งาน และการตั้งค่าลงเครื่องคอมพิวเตอร์ของคุณ
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์ JSON</span>
            </button>
          </div>

          {/* Import */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-sky-600" />
              <span>นำเข้าข้อมูลจากข้อความ JSON (Import)</span>
            </div>
            <textarea
              rows={5}
              placeholder="วางข้อมูล JSON ที่เคยดาวน์โหลดไว้ที่นี่..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full font-mono text-[11px] p-2.5 border border-slate-300 rounded-lg outline-none focus:border-sky-500"
            />

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleImport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>นำเข้าข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
