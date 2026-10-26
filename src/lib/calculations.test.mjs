import test from "node:test";
import assert from "node:assert/strict";
import { calculateDateDuration, evaluateJobOffer } from "./calculations.ts";

test("calculateDateDuration handles standard inclusive dates", () => {
  // 2027-06-01 to 2027-08-24 is 85 calendar days
  const res = calculateDateDuration("2027-06-01", "2027-08-24");
  assert.equal(res.isValid, true);
  assert.equal(res.days, 85);
  assert.equal(Math.round(res.weeks * 100) / 100, 12.14);
});

test("calculateDateDuration rejects end before start", () => {
  const res = calculateDateDuration("2027-08-01", "2027-06-01");
  assert.equal(res.isValid, false);
});

// 1. calculateDateDuration: วันเริ่มงานเท่ากับวันสิ้นสุดงาน (startDate === endDate) ต้องได้ 1 วัน, isValid: true
test("calculateDateDuration handles startDate === endDate as 1 calendar day", () => {
  const res = calculateDateDuration("2027-06-01", "2027-06-01");
  assert.equal(res.isValid, true);
  assert.equal(res.days, 1);
  assert.equal(Math.round(res.weeks * 100) / 100, 0.14);
});

// 2. calculateDateDuration: สตริงวันที่ผิดรูปแบบ ต้องได้ isValid: false
test("calculateDateDuration rejects malformed or invalid date strings", () => {
  const res1 = calculateDateDuration("not-a-date", "2027-06-01");
  assert.equal(res1.isValid, false);

  const res2 = calculateDateDuration("2027-06-01", "invalid-end");
  assert.equal(res2.isValid, false);

  const res3 = calculateDateDuration("", "");
  assert.equal(res3.isValid, false);
});

test("evaluateJobOffer matches calculation-spec fixture", () => {
  // Test fixture from calculation-spec.md Section 10:
  // 12 weeks (84 days, e.g. 2027-06-01 to 2027-08-23 = 84 days = 12 weeks)
  const job = {
    id: "spec-fixture",
    employerName: "Spec Employer",
    jobTitle: "Worker",
    jobGroupType: "ultimate",
    availabilityStatus: "open",
    city: "Test City",
    state: "Colorado",
    employmentStartDate: "2027-06-01",
    employmentEndDate: "2027-08-23", // exactly 84 days = 12 weeks
    hourlyWageUSD: 16,
    expectedHoursPerWeek: 40,
    estimatedDeductionRate: 0.10,
    oneTimeCosts: [
      {
        id: "c1",
        label: "Program & Travel",
        amount: 4500,
        currency: "USD",
        paidUpfront: true,
      },
    ],
    weeklyCosts: [
      {
        id: "w1",
        label: "Living costs",
        amount: 150,
        currency: "USD",
      },
    ],
    refundableDepositsUSD: 0,
    emergencyReserveUSD: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const settings = {
    hideFullJobsByDefault: true,
    currencyDisplay: "USD",
    exchangeRateTHBPerUSD: 35,
    exchangeRateDate: "2026-10-25",
    locale: "th-TH",
  };

  const evalResult = evaluateJobOffer(job, settings);

  assert.equal(evalResult.isComplete, true);
  assert.equal(evalResult.durationWeeks, 12);
  assert.equal(evalResult.totalModeledCostsUSD, 6300);
  assert.equal(evalResult.grossIncomeUSD, 7680);
  assert.equal(evalResult.estimatedDeductionsUSD, 768);
  assert.equal(evalResult.estimatedNetIncomeUSD, 6912);
  assert.equal(evalResult.netReturnUSD, 612);
  assert.equal(evalResult.breakEvenHoursPerWeek, 36.5);
  assert.equal(evalResult.isBreakEvenPossibleWithExpectedHours, true);
});

test("evaluateJobOffer does not treat unknown costs as zero", () => {
  const job = {
    id: "unknown-test",
    employerName: "Missing Airfare Employer",
    jobTitle: "Worker",
    jobGroupType: "ultimate",
    availabilityStatus: "open",
    city: "Test",
    state: "CO",
    employmentStartDate: "2027-06-01",
    employmentEndDate: "2027-08-23",
    hourlyWageUSD: 16,
    expectedHoursPerWeek: 40,
    oneTimeCosts: [
      {
        id: "airfare",
        label: "ค่าตั๋วเครื่องบิน",
        amount: undefined, // UNKNOWN!
        currency: "THB",
        paidUpfront: true,
      },
    ],
    weeklyCosts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const settings = {
    hideFullJobsByDefault: true,
    currencyDisplay: "USD",
    exchangeRateTHBPerUSD: 35,
    exchangeRateDate: "2026-10-25",
    locale: "th-TH",
  };

  const evalResult = evaluateJobOffer(job, settings);
  assert.equal(evalResult.isComplete, false);
  assert.ok(evalResult.missingFields.some((f) => f.includes("ค่าตั๋วเครื่องบิน")));
  // Break-even must not be computed when critical costs are missing
  assert.equal(evalResult.breakEvenHoursPerWeek, undefined);
});

// 3. evaluateJobOffer: ค่าจ้างเป็น 0 หรือติดลบ ต้องรายงานว่าข้อมูลไม่ครบ (isComplete: false)
test("evaluateJobOffer flags zero or negative hourly wage as incomplete", () => {
  const settings = {
    hideFullJobsByDefault: true,
    currencyDisplay: "USD",
    exchangeRateTHBPerUSD: 35,
    exchangeRateDate: "2026-10-25",
    locale: "th-TH",
  };

  const jobZeroWage = {
    id: "zero-wage",
    employerName: "Zero Wage Inc",
    jobTitle: "Unpaid Worker",
    jobGroupType: "ultimate",
    availabilityStatus: "open",
    city: "Nowhere",
    state: "NV",
    employmentStartDate: "2027-06-01",
    employmentEndDate: "2027-08-23",
    hourlyWageUSD: 0,
    expectedHoursPerWeek: 35,
    oneTimeCosts: [],
    weeklyCosts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const resZero = evaluateJobOffer(jobZeroWage, settings);
  assert.equal(resZero.isComplete, false);
  assert.ok(resZero.missingFields.some((f) => f.includes("ค่าจ้าง")));

  const jobNegWage = {
    ...jobZeroWage,
    id: "neg-wage",
    hourlyWageUSD: -5,
  };
  const resNeg = evaluateJobOffer(jobNegWage, settings);
  assert.equal(resNeg.isComplete, false);
  assert.ok(resNeg.missingFields.some((f) => f.includes("ค่าจ้าง")));
});

// 4. evaluateJobOffer: ชั่วโมงทำงานเป็น 0 หรือไม่ระบุ ต้องได้ isComplete: false
test("evaluateJobOffer flags zero or unspecified expected hours as incomplete", () => {
  const settings = {
    hideFullJobsByDefault: true,
    currencyDisplay: "USD",
    exchangeRateTHBPerUSD: 35,
    exchangeRateDate: "2026-10-25",
    locale: "th-TH",
  };

  const jobZeroHours = {
    id: "zero-hours",
    employerName: "Zero Hours Corp",
    jobTitle: "Worker",
    jobGroupType: "ultimate",
    availabilityStatus: "open",
    city: "Nowhere",
    state: "NV",
    employmentStartDate: "2027-06-01",
    employmentEndDate: "2027-08-23",
    hourlyWageUSD: 16,
    expectedHoursPerWeek: 0,
    oneTimeCosts: [],
    weeklyCosts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const resZero = evaluateJobOffer(jobZeroHours, settings);
  assert.equal(resZero.isComplete, false);
  assert.ok(resZero.missingFields.some((f) => f.includes("ชั่วโมงทำงาน")));

  const jobUndefinedHours = {
    ...jobZeroHours,
    id: "undef-hours",
    expectedHoursPerWeek: undefined,
  };
  const resUndef = evaluateJobOffer(jobUndefinedHours, settings);
  assert.equal(resUndef.isComplete, false);
  assert.ok(resUndef.missingFields.some((f) => f.includes("ชั่วโมงทำงาน")));
});

// 5. evaluateJobOffer: อัตราหักภาษีเกิน 1.0 หรือติดลบ ต้องถูก clamp ให้อยู่ในช่วง 0.0 - 1.0
test("evaluateJobOffer clamps deduction rate between 0.0 and 1.0", () => {
  const settings = {
    hideFullJobsByDefault: true,
    currencyDisplay: "USD",
    exchangeRateTHBPerUSD: 35,
    exchangeRateDate: "2026-10-25",
    locale: "th-TH",
  };

  const baseJob = {
    id: "clamp-test",
    employerName: "Tax Test Corp",
    jobTitle: "Worker",
    jobGroupType: "ultimate",
    availabilityStatus: "open",
    city: "Test",
    state: "CO",
    employmentStartDate: "2027-06-01",
    employmentEndDate: "2027-08-23", // 12 weeks
    hourlyWageUSD: 10,
    expectedHoursPerWeek: 40,
    oneTimeCosts: [],
    weeklyCosts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Gross = 10 * 40 * 12 = 4800
  // Negative tax rate (-0.5) must clamp to 0.0 -> deductions = 0
  const jobNegTax = { ...baseJob, estimatedDeductionRate: -0.5 };
  const resNeg = evaluateJobOffer(jobNegTax, settings);
  assert.equal(resNeg.grossIncomeUSD, 4800);
  assert.equal(resNeg.estimatedDeductionsUSD, 0);
  assert.equal(resNeg.estimatedNetIncomeUSD, 4800);

  // Over-100% tax rate (1.5) must clamp to 1.0 -> deductions = 4800, net = 0
  const jobOverTax = { ...baseJob, estimatedDeductionRate: 1.5 };
  const resOver = evaluateJobOffer(jobOverTax, settings);
  assert.equal(resOver.grossIncomeUSD, 4800);
  assert.equal(resOver.estimatedDeductionsUSD, 4800);
  assert.equal(resOver.estimatedNetIncomeUSD, 0);
});

// 6. evaluateJobOffer: ทดสอบการคำนวณสถานการณ์จำลอง (Scenarios: low, expected, high)
test("evaluateJobOffer computes low, expected, and high scenarios accurately", () => {
  const settings = {
    hideFullJobsByDefault: true,
    currencyDisplay: "USD",
    exchangeRateTHBPerUSD: 35,
    exchangeRateDate: "2026-10-25",
    locale: "th-TH",
  };

  const job = {
    id: "scenario-job",
    employerName: "Scenario Employer",
    jobTitle: "Worker",
    jobGroupType: "ultimate",
    availabilityStatus: "open",
    city: "Test",
    state: "CO",
    employmentStartDate: "2027-06-01",
    employmentEndDate: "2027-08-23", // exactly 12 weeks
    hourlyWageUSD: 20,
    expectedHoursPerWeek: 40,
    lowHoursPerWeek: 30,
    highHoursPerWeek: 50,
    estimatedDeductionRate: 0.10, // net wage = 20 * 0.90 = $18/hr
    oneTimeCosts: [{ id: "c1", label: "Fee", amount: 6000, currency: "USD", paidUpfront: true }],
    weeklyCosts: [],
    refundableDepositsUSD: 0,
    emergencyReserveUSD: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = evaluateJobOffer(job, settings);
  assert.equal(res.isComplete, true);
  assert.ok(res.scenarios.low);
  assert.ok(res.scenarios.expected);
  assert.ok(res.scenarios.high);

  // Low case (30 hrs/wk, 12 wks = 360 hrs):
  // Gross = 360 * 20 = 7200, net = 7200 * 0.9 = 6480, net return = 6480 - 6000 = 480
  assert.equal(res.scenarios.low.hoursPerWeek, 30);
  assert.equal(res.scenarios.low.grossIncomeUSD, 7200);
  assert.equal(res.scenarios.low.estimatedNetIncomeUSD, 6480);
  assert.equal(res.scenarios.low.netReturnUSD, 480);
  assert.equal(res.scenarios.low.isBreakEven, true);

  // Expected case (40 hrs/wk, 12 wks = 480 hrs):
  // Gross = 480 * 20 = 9600, net = 9600 * 0.9 = 8640, net return = 8640 - 6000 = 2640
  assert.equal(res.scenarios.expected.hoursPerWeek, 40);
  assert.equal(res.scenarios.expected.grossIncomeUSD, 9600);
  assert.equal(res.scenarios.expected.estimatedNetIncomeUSD, 8640);
  assert.equal(res.scenarios.expected.netReturnUSD, 2640);
  assert.equal(res.scenarios.expected.isBreakEven, true);

  // High case (50 hrs/wk, 12 wks = 600 hrs):
  // Gross = 600 * 20 = 12000, net = 12000 * 0.9 = 10800, net return = 10800 - 6000 = 4800
  assert.equal(res.scenarios.high.hoursPerWeek, 50);
  assert.equal(res.scenarios.high.grossIncomeUSD, 12000);
  assert.equal(res.scenarios.high.estimatedNetIncomeUSD, 10800);
  assert.equal(res.scenarios.high.netReturnUSD, 4800);
  assert.equal(res.scenarios.high.isBreakEven, true);
});
