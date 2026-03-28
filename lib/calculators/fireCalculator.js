/**
 * FIRE Calculator — Financial Independence, Retire Early calculation engine
 * This runs BOTH on client-side (for instant slider updates) and server-side (for API).
 */

const INFLATION = 0.06;
const SAFE_WITHDRAWAL_RATE = 0.04;
const RETURNS = {
  equityMF: 0.12,
  debtMF: 0.07,
  ppf: 0.071,
  epf: 0.082,
  fd: 0.065,
};

export function calculateFirePlan(inputs) {
  const {
    currentAge,
    monthlyIncome,
    monthlyExpenses,
    existingEquityMF = 0,
    existingDebtMF = 0,
    existingPPF = 0,
    existingEPF = 0,
    existingFD = 0,
    currentMonthlySIP = 0,
    targetRetirementAge,
    targetMonthlyWithdrawal,
  } = inputs;

  const yearsToRetirement = Math.max(1, targetRetirementAge - currentAge);

  // Step 1 — Inflation-adjusted corpus needed
  const inflatedMonthlyWithdrawal = targetMonthlyWithdrawal * Math.pow(1 + INFLATION, yearsToRetirement);
  const inflatedAnnualWithdrawal = inflatedMonthlyWithdrawal * 12;
  const requiredCorpus = inflatedAnnualWithdrawal / SAFE_WITHDRAWAL_RATE;

  // Step 2 — Project existing investments to retirement
  const projectedEquityMF = existingEquityMF * Math.pow(1 + RETURNS.equityMF, yearsToRetirement);
  const projectedDebtMF = existingDebtMF * Math.pow(1 + RETURNS.debtMF, yearsToRetirement);
  const projectedPPF = existingPPF * Math.pow(1 + RETURNS.ppf, yearsToRetirement);
  const projectedEPF = existingEPF * Math.pow(1 + RETURNS.epf, yearsToRetirement);
  const projectedFD = existingFD * Math.pow(1 + RETURNS.fd, yearsToRetirement);
  const totalProjected = projectedEquityMF + projectedDebtMF + projectedPPF + projectedEPF + projectedFD;

  // Step 3 — Project existing SIP
  const monthlyReturn = RETURNS.equityMF / 12;
  const months = yearsToRetirement * 12;
  const sipFutureValue = currentMonthlySIP > 0
    ? currentMonthlySIP * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn)
    : 0;

  // Step 4 — Shortfall and additional SIP
  const totalProjectedWithSIP = totalProjected + sipFutureValue;
  const shortfall = Math.max(0, requiredCorpus - totalProjectedWithSIP);

  let additionalSIPNeeded = 0;
  if (shortfall > 0 && months > 0) {
    additionalSIPNeeded = shortfall * monthlyReturn / ((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn));
  }

  // Step 5 — Glidepath (equity% by age)
  const glidepathData = [];
  for (let age = currentAge; age <= targetRetirementAge; age++) {
    let equity, debt;
    if (age <= 40) {
      equity = 80;
      debt = 20;
    } else if (age <= 47) {
      equity = 80 - (age - 40) * 3;
      debt = 100 - equity;
    } else {
      equity = 40;
      debt = 60;
    }
    glidepathData.push({ age, equity, debt });
  }

  // Step 6 — Year-by-year chart data
  const chartData = [];
  const totalExisting = existingEquityMF + existingDebtMF + existingPPF + existingEPF + existingFD;
  const totalSIP = currentMonthlySIP + additionalSIPNeeded;

  for (let year = 0; year <= yearsToRetirement; year++) {
    const age = currentAge + year;

    // Project existing investments to this year
    const projExisting = existingEquityMF * Math.pow(1 + RETURNS.equityMF, year)
      + existingDebtMF * Math.pow(1 + RETURNS.debtMF, year)
      + existingPPF * Math.pow(1 + RETURNS.ppf, year)
      + existingEPF * Math.pow(1 + RETURNS.epf, year)
      + existingFD * Math.pow(1 + RETURNS.fd, year);

    // Project SIP contributions to this year
    const sipMonths = year * 12;
    const sipValue = currentMonthlySIP > 0 && sipMonths > 0
      ? currentMonthlySIP * ((Math.pow(1 + monthlyReturn, sipMonths) - 1) / monthlyReturn) * (1 + monthlyReturn)
      : 0;

    const corpus = projExisting + sipValue;

    // Linear interpolation for target at this year
    const targetAtYear = requiredCorpus * (year / yearsToRetirement);

    chartData.push({
      age,
      corpus: Math.round(corpus),
      target: Math.round(targetAtYear),
    });
  }

  // Insurance gap
  const annualIncome = monthlyIncome * 12;
  const idealTermCover = annualIncome * 10;

  // Summary
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;

  return {
    requiredCorpus: Math.round(requiredCorpus),
    totalProjected: Math.round(totalProjectedWithSIP),
    shortfall: Math.round(shortfall),
    additionalSIPNeeded: Math.round(additionalSIPNeeded),
    inflatedMonthlyWithdrawal: Math.round(inflatedMonthlyWithdrawal),
    glidepathData,
    chartData,
    idealTermCover,
    savingsRate,
    yearsToRetirement,
    projections: {
      equityMF: Math.round(projectedEquityMF),
      debtMF: Math.round(projectedDebtMF),
      ppf: Math.round(projectedPPF),
      epf: Math.round(projectedEPF),
      fd: Math.round(projectedFD),
      sip: Math.round(sipFutureValue),
    },
  };
}
