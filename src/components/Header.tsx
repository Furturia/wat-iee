import React from "react";
import { Info, Sparkles, ShieldAlert, BookOpen } from "lucide-react";
import { isPromotionActive, feeConfig } from "@/lib/fee-config";

interface HeaderProps {
  onOpenFeeRules: () => void;
  isDemoActive: boolean;
}

export function Header({ onOpenFeeRules, isDemoActive }: HeaderProps) {
  const promo = isPromotionActive();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & title */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center p-1.5 bg-sky-600 text-white rounded-lg font-bold text-lg shadow-sm">
                WAT
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                WAT Worth It?
              </h1>
              <span className="text-xs bg-sky-100 text-sky-800 font-medium px-2.5 py-0.5 rounded-full border border-sky-200">
                IEE Thailand Edition
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              ระบบวิเคราะห์เปรียบเทียบงาน Work & Travel: จุดคุ้มทุน • ความปลอดภัยของเมือง • โอกาสหางานที่สอง
            </p>
          </div>

          {/* Status & actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Promo banner badge */}
            <div
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium ${
                promo.isActive
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{promo.message}</span>
            </div>

            {/* Fee config viewer trigger */}
            <button
              onClick={onOpenFeeRules}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md border border-slate-300 font-medium transition-colors"
              title="ดูรายละเอียดค่าธรรมเนียมและสิทธิ์โปรโมชั่นของ IEE"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>เกณฑ์ค่าธรรมเนียม IEE</span>
            </button>
          </div>
        </div>

        {/* Disclaimer strip */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              เว็บนี้เป็นเครื่องมือสนับสนุนการตัดสินใจอิสระ ไม่ได้เป็นตัวแทนอย่างเป็นทางการของ IEE Thailand ตัวเลขเป็นประมาณการ ไม่รับประกันผลตอบแทนจริง
            </span>
          </div>
          {isDemoActive && (
            <div className="flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              <span>กำลังแสดงข้อมูลตัวอย่างจำลอง (Fictional Demo)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

