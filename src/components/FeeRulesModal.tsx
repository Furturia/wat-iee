import React from "react";
import { X, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { feeConfig, isPromotionActive } from "@/lib/fee-config";

interface FeeRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeeRulesModal({ isOpen, onClose }: FeeRulesModalProps) {
  if (!isOpen) return null;

  const promo = isPromotionActive();
  const groupKeys = ["classic", "signature", "exclusive", "ultimate"] as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                ตารางค่าธรรมเนียมและสิทธิ์โปรโมชั่น Agency IEE (4 กลุ่มงาน)
              </h2>
              <p className="text-xs text-slate-500">
                อัปเดตตามประกาศทางการของ IEE Thailand (ค่าโครงการส่วนที่ 2 และค่าดำเนินการกลุ่มงาน)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Promo status */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              promo.isActive
                ? "bg-amber-50/70 border-amber-200 text-amber-900"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">
                ช่วงเวลาโปรโมชั่น: {feeConfig.promotionWindow.startsOn} ถึง{" "}
                {feeConfig.promotionWindow.endsOn}
              </div>
              <p className="text-xs">
                {feeConfig.promotionWindow.label} — {promo.message}
              </p>
              <p className="text-[11px] opacity-80">
                * {feeConfig.promotionWindow.note}
              </p>
            </div>
          </div>

          {/* 4 Groups Comparison Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">
              เปรียบเทียบค่าธรรมเนียม 4 กลุ่มงานของ IEE
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3">รายการค่าใช้จ่าย</th>
                    {groupKeys.map((key) => {
                      const group = feeConfig.groupTypes[key];
                      const isUltimate = key === "ultimate";
                      return (
                        <th
                          key={key}
                          className={`py-2.5 px-3 text-right ${
                            isUltimate
                              ? "bg-sky-50/60 text-sky-950 font-black"
                              : ""
                          }`}
                        >
                          {group.labelTh}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* ค่าสมัคร */}
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-medium">ค่าสมัคร (Application)</td>
                    {groupKeys.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-3 text-right ${
                          key === "ultimate" ? "bg-sky-50/30 font-bold text-slate-900" : ""
                        }`}
                      >
                        {feeConfig.groupTypes[key].fees.applicationFeeTHB?.toLocaleString()} ฿
                      </td>
                    ))}
                  </tr>

                  {/* ส่วนที่ 1 */}
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-medium">ค่าโครงการ ส่วนที่ 1</td>
                    {groupKeys.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-3 text-right ${
                          key === "ultimate" ? "bg-sky-50/30 font-bold text-slate-900" : ""
                        }`}
                      >
                        {feeConfig.groupTypes[key].fees.programFeePart1THB?.toLocaleString()} ฿
                      </td>
                    ))}
                  </tr>

                  {/* ส่วนที่ 2 */}
                  <tr className="bg-amber-50/30 font-semibold">
                    <td className="py-2 px-3 text-amber-900">ค่าโครงการ ส่วนที่ 2</td>
                    {groupKeys.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-3 text-right ${
                          key === "ultimate"
                            ? "bg-sky-50/40 text-amber-950 font-bold"
                            : "text-amber-900"
                        }`}
                      >
                        {feeConfig.groupTypes[key].fees.programFeePart2THB?.toLocaleString()} ฿
                      </td>
                    ))}
                  </tr>

                  {/* ค่าดำเนินการกลุ่มงาน */}
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-medium">ค่าดำเนินการกลุ่มงาน</td>
                    {groupKeys.map((key) => {
                      const amount = feeConfig.groupTypes[key].fees.groupProcessingFeeTHB;
                      return (
                        <td
                          key={key}
                          className={`py-2 px-3 text-right ${
                            amount === 0
                              ? "text-emerald-700 font-bold"
                              : key === "ultimate"
                              ? "bg-sky-50/30 font-bold text-slate-900"
                              : ""
                          }`}
                        >
                          {amount && amount > 0 ? `${amount.toLocaleString()} ฿` : "0 ฿ (ไม่มี)"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* SEVIS */}
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-medium">ค่า SEVIS Fee</td>
                    {groupKeys.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-3 text-right ${
                          key === "ultimate" ? "bg-sky-50/30 font-bold text-slate-900" : ""
                        }`}
                      >
                        {feeConfig.groupTypes[key].fees.sevisFeeTHB?.toLocaleString()} ฿
                      </td>
                    ))}
                  </tr>

                  {/* Visa */}
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-medium">ค่าวีซ่า (DS-160)</td>
                    {groupKeys.map((key) => (
                      <td
                        key={key}
                        className={`py-2 px-3 text-right font-medium ${
                          key === "ultimate" ? "bg-sky-50/30 font-bold text-slate-900" : ""
                        }`}
                      >
                        ${feeConfig.groupTypes[key].fees.visaFeeUSD ?? 185}
                      </td>
                    ))}
                  </tr>

                  {/* รวม */}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2.5 px-3">รวมค่าธรรมเนียมคงที่</td>
                    {groupKeys.map((key) => {
                      const group = feeConfig.groupTypes[key];
                      const visa = group.fees.visaFeeUSD ?? 185;
                      const isUltimate = key === "ultimate";
                      return (
                        <td
                          key={key}
                          className={`py-2.5 px-3 text-right ${
                            isUltimate
                              ? "bg-sky-100/70 text-sky-950 font-black"
                              : ""
                          }`}
                        >
                          {group.knownFixedFeeSubtotalTHB.toLocaleString()} ฿ + ${visa}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * ยอดรวมค่าธรรมเนียมคงที่ข้างต้น ยังไม่รวม: ตั๋วเครื่องบินไป-กลับ, ค่าที่พัก, ค่าอาหาร และค่าใช้จ่ายส่วนตัว
            </p>
          </div>

          {/* Eligibility Rules */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>เงื่อนไขและข้อควรระวัง:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{feeConfig.applicationPaymentEligibility[0]?.messageTh}</li>
              <li>ทุกกลุ่มงานมีค่าดำเนินการกลุ่มงาน 8,000 บาท ยกเว้นกลุ่ม IEE Classic ที่ไม่มีค่าใช้จ่ายนี้ (0 บาท)</li>
              <li>กลุ่ม Ultimate ไม่เข้าร่วมโปรโมชั่นส่วนลดทั่วไป แต่สามารถใช้สิทธิ์ส่วนลดกลุ่มหรือส่วนลดมาเป็นคู่ได้</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 font-semibold text-xs text-white transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
