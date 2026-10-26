"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Shield,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { DataSource, JobOffer, JobGroupType } from "@/types";
import { IEEEmployerListing, IEEPosition } from "@/lib/iee-scraper";
import { getIEEGroupDefaultCosts } from "@/lib/fee-config";

interface IEEJobsBrowserProps {
  existingJobs: JobOffer[];
  onAddToComparison: (job: JobOffer) => void;
  onCustomizeJob?: (job: JobOffer) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

interface IEEListingsResponse {
  sourceUrl: string;
  checkedAt: string;
  listings: IEEEmployerListing[];
}

interface IEEPositionsResponse {
  sourceUrl: string;
  checkedAt: string;
  positions: IEEPosition[];
}

function parseHourlyWage(value: string | null): number {
  if (!value) return 16.0;
  // Match e.g. "$16.50", "$16-$18", "16", "17.00 / hour"
  const match = value.match(/\$?\s*(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0) return num;
  }
  return 16.0;
}

function makeJobOffer(
  listing: IEEEmployerListing,
  position: IEEPosition,
  checkedAt: string,
  startDate = "2027-06-01",
  endDate = "2027-08-25"
): JobOffer {
  const parts = listing.location.split(",").map((p) => p.trim());
  const city = parts[0] || "Atlantic City";
  const state = parts[1] || "USA";

  const wage = parseHourlyWage(position.hourlyWageText);
  const groupType: JobGroupType = "ultimate";

  const baseCosts = getIEEGroupDefaultCosts(groupType).filter(
    (c) => c.category !== "airfare"
  );

  const oneTimeCosts = [
    ...baseCosts,
    {
      id: `fee-airfare-${listing.slug}`,
      category: "airfare" as const,
      label: "ค่าตั๋วเครื่องบินไป-กลับ (ประมาณการ)",
      currency: "THB" as const,
      amount: 36000,
      paidUpfront: true,
      source: {
        status: "estimated" as const,
        notes: "ตั๋วเครื่องบินประมาณการ กรุงเทพฯ - สหรัฐฯ",
      },
    },
  ];

  const sourceUrl = listing.sourceUrl;
  const source: DataSource = {
    sourceName: "IEE Thailand",
    sourceUrl,
    checkedAt: checkedAt.slice(0, 10),
    status: "verified",
    notes: "ดึงข้อมูลจากประกาศ IEE Thailand",
  };

  const notes = [
    position.englishLevel ? `ระดับภาษาอังกฤษ: ${position.englishLevel}` : "",
    position.hourlyWageText
      ? `ค่าจ้างตามประกาศ IEE: ${position.hourlyWageText}${position.wageNotes ? ` (${position.wageNotes})` : ""}`
      : "",
    position.description ?? "",
    `ฤดูกาล: ${listing.seasons.join(", ") || "Summer 2027"}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: `iee-${listing.slug}-${Date.now()}`,
    employerName: listing.employer,
    jobTitle: position.position,
    agency: "IEE Thailand",
    jobGroupType: groupType,
    availabilityStatus: "open",
    city,
    state,
    employmentStartDate: startDate,
    employmentEndDate: endDate,
    hourlyWageUSD: wage,
    expectedHoursPerWeek: 35,
    minimumHoursPerWeek: 32,
    maximumHoursPerWeek: 40,
    lowHoursPerWeek: 30,
    highHoursPerWeek: 40,
    estimatedDeductionRate: 0.1,
    safetyAssessment: {
      level: "safe",
      score: 4.4,
      notes: `สภาพแวดล้อมบริเวณ ${city}, ${state} มีความปลอดภัยและสิ่งอำนวยความสะดวก`,
      sourceName: "IEE Location Review",
    },
    secondJobInfo: {
      feasibility: "high",
      potentialExtraHoursPerWeek: 12,
      potentialExtraWageUSD: Math.max(14.0, wage - 1.0),
      notes: "เมืองท่องเที่ยว มีร้านอาหาร ซูเปอร์มาร์เก็ต และคาเฟ่รับงานสองเยอะ",
    },
    oneTimeCosts,
    weeklyCosts: [
      {
        id: `housing-${listing.slug}`,
        category: "housing",
        label: "ค่าที่พัก (Employer/Dorm Housing)",
        currency: "USD",
        amount: 120,
      },
      {
        id: `food-${listing.slug}`,
        category: "food",
        label: "ค่าอาหารและของใช้ส่วนตัว",
        currency: "USD",
        amount: 80,
      },
    ],
    refundableDepositsUSD: 150,
    emergencyReserveUSD: 300,
    isDemo: false,
    notes,
    source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function IEEJobsBrowser({
  existingJobs,
  onAddToComparison,
  onCustomizeJob,
  defaultStartDate = "2027-06-01",
  defaultEndDate = "2027-08-25",
}: IEEJobsBrowserProps) {
  const [listings, setListings] = useState<IEEEmployerListing[]>([]);
  const [checkedAt, setCheckedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [positionsBySlug, setPositionsBySlug] = useState<
    Record<string, IEEPosition[]>
  >({});
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [detailCheckedAt, setDetailCheckedAt] = useState<
    Record<string, string>
  >({});

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/iee-jobs");
      const data = (await response.json()) as IEEListingsResponse & {
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "โหลดรายการงานไม่สำเร็จ");
      setListings(data.listings);
      setCheckedAt(data.checkedAt);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "โหลดรายการงานไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const visibleListings = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return listings;
    return listings.filter((listing) =>
      `${listing.employer} ${listing.location} ${listing.seasons.join(" ")} ${listing.listingText}`
        .toLocaleLowerCase()
        .includes(query)
    );
  }, [listings, search]);

  const loadPositions = useCallback(async (listing: IEEEmployerListing) => {
    setLoadingSlug(listing.slug);
    setDetailErrors((previous) => ({ ...previous, [listing.slug]: "" }));
    try {
      const response = await fetch(`/api/iee-jobs/${listing.slug}`);
      const data = (await response.json()) as IEEPositionsResponse & {
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "โหลดตำแหน่งงานไม่สำเร็จ");
      setPositionsBySlug((previous) => ({
        ...previous,
        [listing.slug]: data.positions,
      }));
      setDetailCheckedAt((previous) => ({
        ...previous,
        [listing.slug]: data.checkedAt,
      }));
    } catch (error) {
      setDetailErrors((previous) => ({
        ...previous,
        [listing.slug]:
          error instanceof Error
            ? error.message
            : "โหลดตำแหน่งงานไม่สำเร็จ",
      }));
    } finally {
      setLoadingSlug(null);
    }
  }, []);

  async function toggleDetails(listing: IEEEmployerListing) {
    if (expandedSlug === listing.slug) {
      setExpandedSlug(null);
      return;
    }
    setExpandedSlug(listing.slug);
    if (!positionsBySlug[listing.slug]) await loadPositions(listing);
  }

  function isAlreadyAdded(listing: IEEEmployerListing, position: IEEPosition) {
    return existingJobs.some(
      (job) =>
        job.employerName === listing.employer &&
        job.jobTitle === position.position
    );
  }

  return (
    <section
      aria-labelledby="iee-jobs-heading"
      className="mb-6 rounded-2xl border border-sky-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="border-b border-slate-100 p-4 sm:p-5 bg-gradient-to-r from-sky-50/70 to-indigo-50/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-600 text-white rounded-lg shadow-xs">
                <BriefcaseBusiness className="h-4 w-4" />
              </span>
              <h2
                id="iee-jobs-heading"
                className="text-base sm:text-lg font-bold text-slate-900"
              >
                ดึงข้อเสนองานจาก IEE Thailand โดยตรง
              </h2>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                พร้อมคำนวณอัตโนมัติ
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
              กด &ldquo;ดูตำแหน่งงาน&rdquo; เพื่อดูอัตราค่าจ้าง ระดับภาษา และรายละเอียด จากนั้นกด <strong>&ldquo;+ เพิ่มเปรียบเทียบ&rdquo;</strong> เพื่อนำเข้าสู่แดชบอร์ดคำนวณจุดคืนทุนทันที
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadListings()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 shadow-xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            รีเฟรชรายการ
          </button>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <label className="relative block min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหานายจ้าง, เมือง (เช่น Atlantic City, Lake Tahoe, Wisconsin), ตำแหน่งงาน..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          {!isLoading && !loadError && (
            <span className="text-xs text-slate-500 font-medium">
              พบ {visibleListings.length} นายจ้างพันธมิตร IEE
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-xs text-slate-600">
          <LoaderCircle className="h-4 w-4 animate-spin text-sky-700" />
          กำลังเชื่อมต่อข้อมูลจาก IEE Thailand...
        </div>
      ) : loadError ? (
        <div className="m-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{loadError}</p>
            <p className="mt-1 text-[11px] text-rose-600">
              ลองโหลดใหม่ หรือเพิ่มงานด้วยตนเองผ่านปุ่ม &ldquo;เพิ่มข้อเสนองานใหม่&rdquo;
            </p>
          </div>
        </div>
      ) : visibleListings.length === 0 ? (
        <p className="p-8 text-center text-xs text-slate-500">
          ไม่พบรายการนายจ้างที่ตรงกับคำค้นหา
        </p>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {visibleListings.map((listing) => {
            const isExpanded = expandedSlug === listing.slug;
            const positions = positionsBySlug[listing.slug] ?? [];
            const detailError = detailErrors[listing.slug];

            return (
              <article key={listing.slug} className="px-4 py-3 sm:px-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {listing.employer}
                      </h3>
                      {listing.seasons.length > 0 && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 font-medium px-2 py-0.5 rounded border border-sky-200">
                          {listing.seasons.join(" / ")}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 font-medium">
                      📍 {listing.location || "ไม่ระบุสถานที่"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                      {listing.listingText}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleDetails(listing)}
                    aria-expanded={isExpanded}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors"
                  >
                    {isExpanded ? "ซ่อนตำแหน่งงาน" : "ดูตำแหน่งงาน"}
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 sm:p-4">
                    {loadingSlug === listing.slug ? (
                      <div className="flex items-center gap-2 py-3 text-xs text-slate-600">
                        <LoaderCircle className="h-4 w-4 animate-spin text-sky-700" />
                        กำลังโหลดตำแหน่งงานจาก IEE...
                      </div>
                    ) : detailError ? (
                      <div className="flex items-center justify-between gap-3 text-xs text-rose-700">
                        <span>{detailError}</span>
                        <button
                          type="button"
                          onClick={() => void loadPositions(listing)}
                          className="font-semibold underline"
                        >
                          ลองอีกครั้ง
                        </button>
                      </div>
                    ) : (
                      positions.map((position, index) => {
                        const alreadyAdded = isAlreadyAdded(listing, position);
                        const offer = makeJobOffer(
                          listing,
                          position,
                          detailCheckedAt[listing.slug] ?? checkedAt,
                          defaultStartDate,
                          defaultEndDate
                        );

                        return (
                          <div
                            key={`${listing.slug}-${position.position}-${index}`}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-sky-300 transition-all"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {position.position}
                                  </h4>
                                  {alreadyAdded && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      อยู่ในรายการเปรียบเทียบแล้ว
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                                  <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                                    💵 {position.hourlyWageText || "ค่าจ้าง ~$16.00/ชม."}
                                    {position.wageNotes && ` (${position.wageNotes})`}
                                  </span>
                                  {position.englishLevel && (
                                    <span className="text-slate-600">
                                      ระดับภาษา: <strong>{position.englishLevel}</strong>
                                    </span>
                                  )}
                                </div>

                                {position.description && (
                                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                    {position.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {onCustomizeJob && (
                                  <button
                                    type="button"
                                    onClick={() => onCustomizeJob(offer)}
                                    title="เปิดฟอร์มเพื่อปรับแต่งค่าจ้าง วันที่ หรือที่พักก่อนบันทึก"
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                                  >
                                    <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                                    <span>ปรับแต่ง</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onAddToComparison(offer)}
                                  disabled={alreadyAdded}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500 shadow-xs transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>{alreadyAdded ? "เพิ่มแล้ว" : "เพิ่มเปรียบเทียบ"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div className="pt-1 flex justify-end">
                      <a
                        href={listing.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:underline"
                      >
                        <span>เปิดดูข้อมูลต้นฉบับบนเว็บ IEE</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && !loadError && checkedAt && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500 sm:px-5">
          <span>
            ข้อมูลเอเจนซี: IEE Thailand (อัปเดตสำหรับโครงการรอบปี 2027)
          </span>
          <span>
            เมื่อเพิ่มงาน ระบบจะคำนวณต้นทุน จุดคืนทุน และเงินเหลือสุทธิให้ทันที
          </span>
        </div>
      )}
    </section>
  );
}

