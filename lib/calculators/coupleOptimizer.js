/**
 * Couple's Money Optimizer — HRA split, tax bracket, NPS, SIP, net worth
 */

import { calculateHRAExemption, calculateTax } from './taxCalculator.js';

export function optimizeCoupleFinances(partnerA, partnerB, sharedGoals) {
  const results = {};

  // 1. HRA Optimization
  const hraA = partnerA.monthlyRent > 0
    ? calculateHRAExemption(partnerA.monthlyIncome * 12 * 0.4, partnerA.hraComponent * 12, partnerA.monthlyRent * 12, partnerA.isMetroCity)
    : { exemption: 0 };
  const hraB = partnerB.monthlyRent > 0
    ? calculateHRAExemption(partnerB.monthlyIncome * 12 * 0.4, partnerB.hraComponent * 12, partnerB.monthlyRent * 12, partnerB.isMetroCity)
    : { exemption: 0 };

  results.hraOptimization = {
    partnerA: { exemption: hraA.exemption, applicable: partnerA.monthlyRent > 0 },
    partnerB: { exemption: hraB.exemption, applicable: partnerB.monthlyRent > 0 },
    recommendation: hraA.exemption > hraB.exemption
      ? `Partner A saves ₹${Math.round(hraA.exemption).toLocaleString('en-IN')} via HRA. Register rent under Partner A.`
      : hraB.exemption > 0
      ? `Partner B saves ₹${Math.round(hraB.exemption).toLocaleString('en-IN')} via HRA. Register rent under Partner B.`
      : 'Neither partner has significant HRA benefit.',
  };

  // 2. Tax Bracket Optimization
  const incomeA = partnerA.monthlyIncome * 12;
  const incomeB = partnerB.monthlyIncome * 12;
  const taxRateA = incomeA > 1000000 ? 30 : incomeA > 500000 ? 20 : 5;
  const taxRateB = incomeB > 1000000 ? 30 : incomeB > 500000 ? 20 : 5;

  const fdRecommendation = taxRateA !== taxRateB
    ? `Register all FDs under ${taxRateA < taxRateB ? 'Partner A' : 'Partner B'}'s name (lower bracket: ${Math.min(taxRateA, taxRateB)}% vs ${Math.max(taxRateA, taxRateB)}%).`
    : 'Both partners are in the same tax bracket — no FD optimization needed.';

  results.taxBracketOptimization = {
    partnerA: { annualIncome: incomeA, taxRate: taxRateA },
    partnerB: { annualIncome: incomeB, taxRate: taxRateB },
    fdRecommendation,
  };

  // 3. Joint NPS
  const npsA = 50000, npsB = 50000;
  const npsSavingA = Math.round(npsA * taxRateA / 100);
  const npsSavingB = Math.round(npsB * taxRateB / 100);

  results.jointNPS = {
    partnerA: { contribution: npsA, taxSaving: npsSavingA },
    partnerB: { contribution: npsB, taxSaving: npsSavingB },
    combinedDeduction: npsA + npsB,
    combinedSaving: npsSavingA + npsSavingB,
    summary: `Combined NPS deduction: ₹${(npsA + npsB).toLocaleString('en-IN')}. Partner A saves ₹${npsSavingA.toLocaleString('en-IN')}. Partner B saves ₹${npsSavingB.toLocaleString('en-IN')}. Total: ₹${(npsSavingA + npsSavingB).toLocaleString('en-IN')}/year.`,
  };

  // 4. SIP Split based on risk profiles and goals
  const monthlySavingsA = partnerA.monthlyIncome - partnerA.monthlyExpenses - (partnerA.loanEMIs || 0);
  const monthlySavingsB = partnerB.monthlyIncome - partnerB.monthlyExpenses - (partnerB.loanEMIs || 0);
  const totalSavings = Math.max(0, monthlySavingsA) + Math.max(0, monthlySavingsB);

  const riskAllocation = { conservative: { equity: 30, debt: 70 }, moderate: { equity: 60, debt: 40 }, aggressive: { equity: 80, debt: 20 } };
  const allocA = riskAllocation[partnerA.riskProfile || 'moderate'];
  const allocB = riskAllocation[partnerB.riskProfile || 'moderate'];

  const sipRecommendations = [];
  if (sharedGoals?.houseGoal) {
    const { targetAmount, timelineYears } = sharedGoals.houseGoal;
    const r = 0.10 / 12;
    const m = timelineYears * 12;
    const sip = m > 0 ? targetAmount * r / ((Math.pow(1 + r, m) - 1) * (1 + r)) : 0;
    sipRecommendations.push({ goal: 'House', monthlySIP: Math.round(sip), timeline: timelineYears, target: targetAmount });
  }
  if (sharedGoals?.childEducation) {
    const { targetAmount, timelineYears } = sharedGoals.childEducation;
    const r = 0.12 / 12;
    const m = timelineYears * 12;
    const sip = m > 0 ? targetAmount * r / ((Math.pow(1 + r, m) - 1) * (1 + r)) : 0;
    sipRecommendations.push({ goal: 'Child Education', monthlySIP: Math.round(sip), timeline: timelineYears, target: targetAmount });
  }

  results.sipSplit = {
    partnerA: { monthlySavings: Math.max(0, monthlySavingsA), allocation: allocA },
    partnerB: { monthlySavings: Math.max(0, monthlySavingsB), allocation: allocB },
    totalMonthlySavings: totalSavings,
    goalSIPs: sipRecommendations,
  };

  // 5. Combined Net Worth
  const assetsA = (partnerA.existingInvestments?.equityMF || 0) + (partnerA.existingInvestments?.ppf || 0) + (partnerA.existingInvestments?.nps || 0);
  const assetsB = (partnerB.existingInvestments?.equityMF || 0) + (partnerB.existingInvestments?.ppf || 0) + (partnerB.existingInvestments?.nps || 0);
  const liabilitiesA = (partnerA.loanEMIs || 0) * 12 * 5;
  const liabilitiesB = (partnerB.loanEMIs || 0) * 12 * 5;

  results.combinedNetWorth = {
    partnerA: { assets: assetsA, liabilities: liabilitiesA, net: assetsA - liabilitiesA },
    partnerB: { assets: assetsB, liabilities: liabilitiesB, net: assetsB - liabilitiesB },
    totalAssets: assetsA + assetsB,
    totalLiabilities: liabilitiesA + liabilitiesB,
    netWorth: assetsA + assetsB - liabilitiesA - liabilitiesB,
    chartData: [
      { name: 'Partner A Assets', value: assetsA, fill: '#84d6b9' },
      { name: 'Partner B Assets', value: assetsB, fill: '#0F6E56' },
      { name: 'Joint Liabilities', value: liabilitiesA + liabilitiesB, fill: '#ffb4ab' },
    ],
  };

  return results;
}
