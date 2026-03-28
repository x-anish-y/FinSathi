/**
 * Data Collector Agent — Input validation and sanitization
 */

export function validateHealthScoreInputs(data) {
  const errors = [];
  // Use defaults for missing values instead of hard-failing
  const sanitized = {
    ...data,
    currentAge: parseInt(data.currentAge) || 30,
    retirementAge: parseInt(data.retirementAge) || 60,
    emergencyMonths: data.emergencyMonths || '0',
    hasTermInsurance: data.hasTermInsurance || 'no',
    investmentType: data.investmentType || 'fd_only',
    emiPercentage: data.emiPercentage || '0',
    has80C: data.has80C || 'no',
  };
  if (sanitized.currentAge < 18 || sanitized.currentAge > 80) errors.push('Age must be 18-80');
  return { valid: errors.length === 0, errors, sanitized };
}

export function validateFireInputs(data) {
  const errors = [];
  const n = (v) => parseFloat(v) || 0;
  if (!data.currentAge || data.currentAge < 18 || data.currentAge > 70) errors.push('Current age must be 18-70');
  if (!data.targetRetirementAge || data.targetRetirementAge <= (data.currentAge || 0)) errors.push('Retirement age must be greater than current age');
  if (!data.monthlyIncome || data.monthlyIncome <= 0) errors.push('Monthly income required');
  if (!data.targetMonthlyWithdrawal || data.targetMonthlyWithdrawal <= 0) errors.push('Target monthly withdrawal required');
  return {
    valid: errors.length === 0, errors,
    sanitized: {
      currentAge: parseInt(data.currentAge), monthlyIncome: n(data.monthlyIncome), monthlyExpenses: n(data.monthlyExpenses),
      existingEquityMF: n(data.existingEquityMF), existingDebtMF: n(data.existingDebtMF), existingPPF: n(data.existingPPF),
      existingEPF: n(data.existingEPF), existingFD: n(data.existingFD), currentMonthlySIP: n(data.currentMonthlySIP),
      targetRetirementAge: parseInt(data.targetRetirementAge), targetMonthlyWithdrawal: n(data.targetMonthlyWithdrawal),
    },
  };
}

export function validateTaxInputs(data) {
  const errors = [];
  const n = (v) => parseFloat(v) || 0;
  if (!data.basicSalary || data.basicSalary <= 0) errors.push('Basic salary required');
  return {
    valid: errors.length === 0, errors,
    sanitized: {
      basicSalary: n(data.basicSalary), hraReceived: n(data.hraReceived), otherAllowances: n(data.otherAllowances),
      monthlyRent: n(data.monthlyRent), isMetroCity: data.isMetroCity === true || data.isMetroCity === 'true',
      investments80C: n(data.investments80C), nps80CCD1B: n(data.nps80CCD1B), homeLoanInterest: n(data.homeLoanInterest),
      healthInsurance80D: n(data.healthInsurance80D), otherDeductions80G: n(data.otherDeductions80G),
      employerNPSContribution: n(data.employerNPSContribution),
    },
  };
}

export function validateMFData(funds) {
  if (!Array.isArray(funds) || funds.length === 0) return { valid: false, errors: ['No fund data provided'] };
  return { valid: true, errors: [], sanitized: funds };
}

export function validateCoupleInputs(data) {
  const errors = [];
  if (!data.partnerA?.monthlyIncome) errors.push('Partner A monthly income required');
  if (!data.partnerB?.monthlyIncome) errors.push('Partner B monthly income required');
  return { valid: errors.length === 0, errors, sanitized: data };
}
