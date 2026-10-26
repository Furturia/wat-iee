import feeConfigRaw from "../../config/iee-fees-promotions.json";
import { JobGroupType, MoneyInput } from "@/types";

export interface IEEGroupFeeDetail {
  labelTh: string;
  fees: {
    applicationFeeTHB: number | null;
    programFeePart1THB: number | null;
    programFeePart2THB: number | null;
    groupProcessingFeeTHB: number | null;
    visaFeeUSD: number | null;
    sevisFeeTHB: number | null;
    airfareTHB: number | null;
    otherFeesTHB: number | null;
  };
  promotionEligibility?: {
    eligibleForGeneralPromotion?: boolean | null;
    allowedDiscountTypes?: string[];
    groupAndPairDiscountMayBeCombined?: boolean | null;
    discountAmounts?: any;
    noteTh?: string;
  };
  knownFixedFeeSubtotalTHB: number;
  knownFixedFeeSubtotalUSD: number;
  subtotalExcludes: string[];
  notesTh: string;
}

export interface IEEFeeConfig {
  schemaVersion: number;
  configId: string;
  provider: string;
  sourceStatus: string;
  lastReviewedDate: string;
  currencyRules: {
    primaryTripBudgetCurrency: string;
    displayCurrencies: string[];
    exchangeRateTHBPerUSD: number | null;
    exchangeRateEffectiveDate: string | null;
    note: string;
  };
  promotionWindow: {
    startsOn: string;
    endsOn: string;
    inclusive: boolean;
    label: string;
    amountsOrPercentagesProvided: boolean;
    note: string;
  };
  applicationPaymentEligibility: Array<{
    applicationFeePaidTHB: number;
    eligibleGroupTypes: string[];
    ineligibleGroupTypes: string[];
    messageTh: string;
    sourceStatus: string;
  }>;
  groupTypes: {
    classic: IEEGroupFeeDetail;
    signature: IEEGroupFeeDetail;
    exclusive: IEEGroupFeeDetail;
    ultimate: IEEGroupFeeDetail;
  };
  calculationRules: {
    neverTreatUnknownAsZero: boolean;
    neverDoubleCountIncludedFees: boolean;
    refundableDepositsExcludedFromFinalCostUnlessLost: boolean;
    emergencyReserveIsCashBufferNotExpense: boolean;
    discountOnlyAppliedWhenAmountOrRateIsKnown: boolean;
    showExpiredPromotionAsInactive: boolean;
    sourceNote: string;
  };
}

export const feeConfig: IEEFeeConfig = feeConfigRaw as unknown as IEEFeeConfig;

/**
 * Checks if the promotion is currently active based on the date
 */
export function isPromotionActive(currentDateStr = "2026-10-25"): {
  isActive: boolean;
  message: string;
} {
  const window = feeConfig.promotionWindow;
  if (currentDateStr >= window.startsOn && currentDateStr <= window.endsOn) {
    return {
      isActive: true,
      message: `${window.label} (สถานะ: เปิดรับสิทธิ์)`,
    };
  }
  return {
    isActive: false,
    message: `${window.label} (สถานะ: หมดเขตโปรโมชั่นแล้ว)`,
  };
}

/**
 * Generates default one-time cost line items for a chosen IEE group type
 * directly from configuration.
 */
export function getIEEGroupDefaultCosts(groupType: JobGroupType): MoneyInput[] {
  const validGroupKey = (groupType === "classic" || groupType === "signature" || groupType === "exclusive" || groupType === "ultimate")
    ? groupType
    : "ultimate";

  const groupInfo = feeConfig.groupTypes[validGroupKey];
  const fees = groupInfo.fees;
  const items: MoneyInput[] = [];

  if (fees.applicationFeeTHB !== null && fees.applicationFeeTHB !== undefined) {
    items.push({
      id: "fee-application",
      category: "program",
      label: `ค่าสมัครโครงการ (${groupInfo.labelTh})`,
      currency: "THB",
      amount: fees.applicationFeeTHB,
      paidUpfront: true,
      source: {
        status: "user_entered",
        sourceName: "ประกาศค่าธรรมเนียม IEE",
        checkedAt: feeConfig.lastReviewedDate,
      },
    });
  }

  if (fees.programFeePart1THB !== null && fees.programFeePart1THB !== undefined) {
    items.push({
      id: "fee-program-part1",
      category: "program",
      label: "ค่าโครงการ ส่วนที่ 1",
      currency: "THB",
      amount: fees.programFeePart1THB,
      paidUpfront: true,
      source: {
        status: "user_entered",
        sourceName: "ประกาศค่าธรรมเนียม IEE",
        checkedAt: feeConfig.lastReviewedDate,
      },
    });
  }

  if (fees.programFeePart2THB !== null && fees.programFeePart2THB !== undefined) {
    items.push({
      id: "fee-program-part2",
      category: "program",
      label: `ค่าโครงการ ส่วนที่ 2 (${groupInfo.labelTh})`,
      currency: "THB",
      amount: fees.programFeePart2THB,
      paidUpfront: true,
      source: {
        status: "user_entered",
        sourceName: "ประกาศค่าธรรมเนียม IEE",
        checkedAt: feeConfig.lastReviewedDate,
      },
    });
  }

  if (fees.groupProcessingFeeTHB !== null && fees.groupProcessingFeeTHB !== undefined && fees.groupProcessingFeeTHB > 0) {
    items.push({
      id: "fee-group-proc",
      category: "program",
      label: `ค่าดำเนินการกลุ่มงาน (${groupInfo.labelTh})`,
      currency: "THB",
      amount: fees.groupProcessingFeeTHB,
      paidUpfront: true,
      source: {
        status: "user_entered",
        sourceName: "ประกาศค่าธรรมเนียม IEE",
        checkedAt: feeConfig.lastReviewedDate,
      },
    });
  }

  if (fees.sevisFeeTHB !== null && fees.sevisFeeTHB !== undefined) {
    items.push({
      id: "fee-sevis",
      category: "sevis",
      label: "ค่า SEVIS Fee",
      currency: "THB",
      amount: fees.sevisFeeTHB,
      paidUpfront: true,
      source: {
        status: "user_entered",
        sourceName: "ประกาศค่าธรรมเนียม IEE",
        checkedAt: feeConfig.lastReviewedDate,
      },
    });
  }

  if (fees.visaFeeUSD !== null && fees.visaFeeUSD !== undefined) {
    items.push({
      id: "fee-visa",
      category: "visa",
      label: "ค่าวีซ่าอเมริกา (DS-160)",
      currency: "USD",
      amount: fees.visaFeeUSD,
      paidUpfront: true,
      source: {
        status: "user_entered",
        sourceName: "ประกาศค่าธรรมเนียม IEE",
        checkedAt: feeConfig.lastReviewedDate,
      },
    });
  }

  // Airfare must be included as an item with undefined amount so user sees it is required
  items.push({
    id: "fee-airfare",
    category: "airfare",
    label: "ค่าตั๋วเครื่องบินไป-กลับ (ต้องระบุตามจริง)",
    currency: "THB",
    amount: undefined,
    paidUpfront: true,
    source: {
      status: "unknown",
      notes: "สายการบินขึ้นอยู่กับช่วงเวลาและเมืองปลายทางของผู้สมัคร",
    },
  });

  return items;
}
