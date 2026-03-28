/**
 * Health Scorer — 6-dimension financial health scoring engine
 * Pure JS rules, no external dependencies
 */

export function calculateHealthScore(answers) {
  const scores = {};

  // 1. Emergency Preparedness (Q1)
  const emergencyMonths = parseFloat(answers.emergencyMonths) || 0;
  if (emergencyMonths >= 6) scores.emergency_preparedness = 100;
  else if (emergencyMonths >= 3) scores.emergency_preparedness = 70;
  else if (emergencyMonths >= 1) scores.emergency_preparedness = 30;
  else scores.emergency_preparedness = 5;

  // 2. Insurance Coverage (Q2, Q3, Q11)
  const hasTermInsurance = answers.hasTermInsurance === 'yes' || answers.hasTermInsurance === true;
  const sumAssuredMultiple = parseFloat(answers.sumAssuredMultiple) || 0;
  const hasHealthInsurance = answers.hasHealthInsurance === 'yes' || answers.hasHealthInsurance === true;

  if (!hasTermInsurance) {
    scores.insurance_coverage = 0;
  } else if (sumAssuredMultiple >= 10) {
    scores.insurance_coverage = 100;
  } else if (sumAssuredMultiple >= 5) {
    scores.insurance_coverage = 60;
  } else {
    scores.insurance_coverage = 30;
  }

  if (!hasHealthInsurance) {
    scores.insurance_coverage = Math.max(0, (scores.insurance_coverage || 0) - 20);
  }

  // 3. Investment Diversification (Q4)
  const investmentType = answers.investmentType;
  const diversificationMap = {
    'fd_only': 20,
    'fd_mf': 50,
    'mf_stocks': 75,
    'mf_stocks_gold': 100,
  };
  scores.investment_diversification = diversificationMap[investmentType] || 20;

  // 4. Debt Health (Q5, Q6)
  const emiPercentage = answers.emiPercentage;
  const emiMap = {
    '0': 100,
    '10_20': 85,
    '20_30': 65,
    '30_50': 40,
    '50_plus': 10,
  };
  scores.debt_health = emiMap[emiPercentage] || 100;

  const paysFullCreditCard = answers.paysFullCreditCard;
  if (paysFullCreditCard === 'no') {
    scores.debt_health = Math.max(0, scores.debt_health - 15);
  }

  // 5. Tax Efficiency (Q7, Q8)
  const has80C = answers.has80C;
  const hasHRA = answers.hasHRA === 'yes' || answers.hasHRA === true;

  if (has80C === 'yes' && hasHRA) {
    scores.tax_efficiency = 100;
  } else if (has80C === 'yes') {
    scores.tax_efficiency = 70;
  } else if (has80C === 'partial') {
    scores.tax_efficiency = 40;
  } else {
    scores.tax_efficiency = 10;
  }

  // 6. Retirement Readiness (Q9, Q10, Q12)
  const targetCorpusCr = parseFloat(answers.targetCorpusCr) || 5;
  const currentAge = parseInt(answers.currentAge) || 30;
  const retirementAge = parseInt(answers.retirementAge) || 60;
  const currentSavings = parseFloat(answers.currentSavings) || 0;
  const monthlySIP = parseFloat(answers.monthlySIP) || 0;

  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const monthlyReturn = 0.12 / 12;
  const months = yearsToRetirement * 12;

  const projectedSavings = currentSavings * Math.pow(1.12, yearsToRetirement);
  const sipFV = monthlySIP > 0
    ? monthlySIP * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * (1 + monthlyReturn)
    : 0;
  const totalProjected = projectedSavings + sipFV;
  const targetCorpus = targetCorpusCr * 10000000;

  const retirementRatio = targetCorpus > 0 ? (totalProjected / targetCorpus) * 100 : 50;
  scores.retirement_readiness = Math.min(100, Math.round(retirementRatio));

  const hasWill = answers.hasWill === 'yes' || answers.hasWill === true;
  if (!hasWill) {
    scores.retirement_readiness = Math.max(0, scores.retirement_readiness - 10);
  }

  // Calculate total score (average of 6 dimensions)
  const dimensions = Object.values(scores);
  const totalScore = Math.round(dimensions.reduce((a, b) => a + b, 0) / dimensions.length);

  return { scores, totalScore };
}

export function getWeakestDimensions(scores, count = 3) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, count)
    .map(([dimension, score]) => ({ dimension, score }));
}
