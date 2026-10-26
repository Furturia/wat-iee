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
