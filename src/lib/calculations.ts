import type { AppSettings, CalculationEvaluation, JobOffer, ScenarioResult } from "../types/index.ts";

/**
 * Calculates calendar days and weeks between inclusive employment dates.
 */
export function calculateDateDuration(
  startDateStr?: string,
  endDateStr?: string
): { days: number; weeks: number; isValid: boolean; error?: string } {
  if (!startDateStr || !endDateStr) {
    return { days: 0, weeks: 0, isValid: false, error: "ยังไม่ได้ระบุวันที่เริ่มหรือสิ้นสุดงาน" };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { days: 0, weeks: 0, isValid: false, error: "รูปแบบวันที่ไม่ถูกต้อง" };
  }

  // Calculate inclusive calendar days
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) {
    return { days: 0, weeks: 0, isValid: false, error: "วันสิ้นสุดงานต้องไม่อยู่ก่อนวันเริ่มงาน" };
  }

  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const weeks = days / 7;

  return { days, weeks, isValid: true };
}

/**
 * Evaluates a JobOffer thoroughly, keeping track of missing fields,
 * calculating upfront requirements, modeled costs, gross income, deductions,
 * net return, and break-even hours.
 */
export function evaluateJobOffer(
  job: JobOffer,
  settings: AppSettings,
  overrideDates?: { startDate?: string; endDate?: string }
): CalculationEvaluation {
  const missingFields: string[] = [];
  const exchangeRate = settings.exchangeRateTHBPerUSD > 0 ? settings.exchangeRateTHBPerUSD : 35;

  // Determine which dates to use:
  // If applyGlobalDatesToAll is enabled OR job has no start/end date, use global dates
  const useGlobal = settings.applyGlobalDatesToAll || !job.employmentStartDate || !job.employmentEndDate;
  const startDate = overrideDates?.startDate || (useGlobal && settings.globalStartDate ? settings.globalStartDate : (job.employmentStartDate || settings.globalStartDate));
  const endDate = overrideDates?.endDate || (useGlobal && settings.globalEndDate ? settings.globalEndDate : (job.employmentEndDate || settings.globalEndDate));

  const duration = calculateDateDuration(startDate, endDate);
  if (!duration.isValid) {
    missingFields.push(duration.error || "วันที่จ้างงาน");
  }

  if (job.hourlyWageUSD === undefined || job.hourlyWageUSD <= 0) {
    missingFields.push("อัตราค่าจ้างรายชั่วโมง (USD)");
  }

  if (job.expectedHoursPerWeek === undefined || job.expectedHoursPerWeek <= 0) {
    missingFields.push("ชั่วโมงทำงานที่คาดการณ์ต่อสัปดาห์");
  }

  // One-time costs check & sum
  let totalOneTimeUSD = 0;
  let upfrontOneTimeUSD = 0;

  for (const item of job.oneTimeCosts) {
    if (item.amount === undefined || item.amount === null) {
      missingFields.push(`ค่าใช้จ่าย: ${item.label} (ยังไม่ระบุจำนวน)`);
      continue;
    }
    const amountInUSD = item.currency === "THB" ? item.amount / exchangeRate : item.amount;
    totalOneTimeUSD += amountInUSD;
    if (item.paidUpfront) {
      upfrontOneTimeUSD += amountInUSD;
    }
  }

  // Weekly costs check & sum
  let weeklyRecurringUSD = 0;
  for (const item of job.weeklyCosts) {
    if (item.amount === undefined || item.amount === null) {
      missingFields.push(`ค่าใช้จ่ายรายสัปดาห์: ${item.label} (ยังไม่ระบุจำนวน)`);
      continue;
    }
    const amountInUSD = item.currency === "THB" ? item.amount / exchangeRate : item.amount;
    weeklyRecurringUSD += amountInUSD;
  }

  const weeks = duration.isValid ? duration.weeks : 0;
  const days = duration.isValid ? duration.days : 0;

  // Modeled costs
  const totalModeledCostsUSD = totalOneTimeUSD + (weeklyRecurringUSD * weeks);
  const totalModeledCostsTHB = totalModeledCostsUSD * exchangeRate;

  // Upfront cash required (includes deposits + reserve buffer)
  const depositsUSD = job.refundableDepositsUSD ?? 0;
  const reserveUSD = job.emergencyReserveUSD ?? 0;
  const upfrontCashUSD = upfrontOneTimeUSD + depositsUSD + reserveUSD;
  const upfrontCashTHB = upfrontCashUSD * exchangeRate;

  // Deduction rate (default 10% if unspecified)
  const deductionRate = job.estimatedDeductionRate !== undefined ? Math.max(0, Math.min(1, job.estimatedDeductionRate)) : 0.10;

  // Income calculations
  const wage = job.hourlyWageUSD ?? 0;
  const expectedHours = job.expectedHoursPerWeek ?? 0;

  const grossIncomeUSD = wage * expectedHours * weeks;
  const grossIncomeTHB = grossIncomeUSD * exchangeRate;

  const estimatedDeductionsUSD = grossIncomeUSD * deductionRate;
  const estimatedDeductionsTHB = estimatedDeductionsUSD * exchangeRate;

  const estimatedNetIncomeUSD = grossIncomeUSD - estimatedDeductionsUSD;
  const estimatedNetIncomeTHB = estimatedNetIncomeUSD * exchangeRate;

  const netReturnUSD = estimatedNetIncomeUSD - totalModeledCostsUSD;
  const netReturnTHB = netReturnUSD * exchangeRate;

  // Break-even hours/week calculation
  // Formula: modeledCosts / (wage * (1 - deductionRate) * weeks)
  let breakEvenHoursPerWeek: number | undefined = undefined;
  const netHourlyRate = wage * (1 - deductionRate);

  if (netHourlyRate > 0 && weeks > 0 && totalModeledCostsUSD > 0 && missingFields.length === 0) {
    const rawBreakEven = totalModeledCostsUSD / (netHourlyRate * weeks);
    breakEvenHoursPerWeek = Math.round(rawBreakEven * 10) / 10;
  }

  const isBreakEvenPossibleWithExpectedHours = breakEvenHoursPerWeek !== undefined && expectedHours >= breakEvenHoursPerWeek;
  const hoursShortfallOrSurplus = breakEvenHoursPerWeek !== undefined ? expectedHours - breakEvenHoursPerWeek : 0;

  // Scenario helper
  const buildScenario = (hours?: number): ScenarioResult | undefined => {
    if (hours === undefined || hours <= 0 || !duration.isValid || wage <= 0) return undefined;
    const gross = wage * hours * weeks;
    const ded = gross * deductionRate;
    const netInc = gross - ded;
    const ret = netInc - totalModeledCostsUSD;
    return {
      hoursPerWeek: hours,
      grossIncomeUSD: gross,
      grossIncomeTHB: gross * exchangeRate,
      estimatedDeductionsUSD: ded,
      estimatedDeductionsTHB: ded * exchangeRate,
      estimatedNetIncomeUSD: netInc,
      estimatedNetIncomeTHB: netInc * exchangeRate,
      netReturnUSD: ret,
      netReturnTHB: ret * exchangeRate,
      isBreakEven: breakEvenHoursPerWeek !== undefined ? hours >= breakEvenHoursPerWeek : ret >= 0,
      hoursMarginFromBreakEven: breakEvenHoursPerWeek !== undefined ? hours - breakEvenHoursPerWeek : 0,
    };
  };

  const scenarios = {
    low: buildScenario(job.lowHoursPerWeek ?? (job.minimumHoursPerWeek ?? Math.max(15, expectedHours - 8))),
    expected: buildScenario(expectedHours),
    high: buildScenario(job.highHoursPerWeek ?? (job.maximumHoursPerWeek ?? expectedHours + 8)),
  };

  return {
    jobId: job.id,
    isComplete: missingFields.length === 0,
    missingFields,
    durationDays: days,
    durationWeeks: Math.round(weeks * 10) / 10,
    upfrontCashUSD,
    upfrontCashTHB,
    refundableDepositsUSD: depositsUSD,
    emergencyReserveUSD: reserveUSD,
    totalOneTimeCostsUSD: totalOneTimeUSD,
    totalOneTimeCostsTHB: totalOneTimeUSD * exchangeRate,
    weeklyRecurringCostUSD: weeklyRecurringUSD,
    weeklyRecurringCostTHB: weeklyRecurringUSD * exchangeRate,
    totalModeledCostsUSD,
    totalModeledCostsTHB,
    grossIncomeUSD,
    grossIncomeTHB,
    estimatedDeductionsUSD,
    estimatedDeductionsTHB,
    estimatedNetIncomeUSD,
    estimatedNetIncomeTHB,
    netReturnUSD,
    netReturnTHB,
    breakEvenHoursPerWeek,
    isBreakEvenPossibleWithExpectedHours,
    hoursShortfallOrSurplus: Math.round(hoursShortfallOrSurplus * 10) / 10,
    scenarios,
  };
}
