/**
 * Tax Calculator — Old vs New Regime comparison with step-by-step working
 * FY2024-25 slabs, HRA exemption, deductions, surcharge, cess, rebate 87A
 */

function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function calculateHRAExemption(basicSalary, hraReceived, annualRent, isMetro) {
  const condition1 = hraReceived;
  const condition2 = annualRent - (0.10 * basicSalary);
  const condition3 = isMetro ? 0.50 * basicSalary : 0.40 * basicSalary;
  const exemption = Math.max(0, Math.min(condition1, Math.max(0, condition2), condition3));

  return {
    exemption,
    conditions: { condition1, condition2: Math.max(0, condition2), condition3 },
    reasoning: `HRA exemption = minimum of (Actual HRA: ${fmtINR(condition1)}, Rent − 10% Basic: ${fmtINR(Math.max(0, condition2))}, ${isMetro ? '50' : '40'}% of Basic: ${fmtINR(condition3)}) = ${fmtINR(exemption)}`,
  };
}

function calculateOldRegimeTax(taxableIncome) {
  let tax = 0;
  const slabs = [];

  if (taxableIncome <= 250000) {
    slabs.push({ slab: '0 − 2,50,000', rate: '0%', tax: 0 });
    return { tax: 0, slabs };
  }

  // 0 − 2.5L: 0%
  slabs.push({ slab: '0 − 2,50,000', rate: '0%', tax: 0 });

  // 2.5L − 5L: 5%
  const slab2 = Math.min(taxableIncome, 500000) - 250000;
  if (slab2 > 0) {
    const t = slab2 * 0.05;
    tax += t;
    slabs.push({ slab: '2,50,001 − 5,00,000', rate: '5%', tax: t });
  }

  // 5L − 10L: 20%
  const slab3 = Math.min(taxableIncome, 1000000) - 500000;
  if (slab3 > 0) {
    const t = slab3 * 0.20;
    tax += t;
    slabs.push({ slab: '5,00,001 − 10,00,000', rate: '20%', tax: t });
  }

  // Above 10L: 30%
  const slab4 = taxableIncome - 1000000;
  if (slab4 > 0) {
    const t = slab4 * 0.30;
    tax += t;
    slabs.push({ slab: 'Above 10,00,000', rate: '30%', tax: t });
  }

  return { tax, slabs };
}

function calculateNewRegimeTax(taxableIncome) {
  let tax = 0;
  const slabs = [];

  if (taxableIncome <= 300000) {
    slabs.push({ slab: '0 − 3,00,000', rate: '0%', tax: 0 });
    return { tax: 0, slabs };
  }

  slabs.push({ slab: '0 − 3,00,000', rate: '0%', tax: 0 });

  // 3L − 7L: 5%
  const slab2 = Math.min(taxableIncome, 700000) - 300000;
  if (slab2 > 0) {
    const t = slab2 * 0.05;
    tax += t;
    slabs.push({ slab: '3,00,001 − 7,00,000', rate: '5%', tax: t });
  }

  // 7L − 10L: 10%
  const slab3 = Math.min(taxableIncome, 1000000) - 700000;
  if (slab3 > 0) {
    const t = slab3 * 0.10;
    tax += t;
    slabs.push({ slab: '7,00,001 − 10,00,000', rate: '10%', tax: t });
  }

  // 10L − 12L: 15%
  const slab4 = Math.min(taxableIncome, 1200000) - 1000000;
  if (slab4 > 0) {
    const t = slab4 * 0.15;
    tax += t;
    slabs.push({ slab: '10,00,001 − 12,00,000', rate: '15%', tax: t });
  }

  // 12L − 15L: 20%
  const slab5 = Math.min(taxableIncome, 1500000) - 1200000;
  if (slab5 > 0) {
    const t = slab5 * 0.20;
    tax += t;
    slabs.push({ slab: '12,00,001 − 15,00,000', rate: '20%', tax: t });
  }

  // Above 15L: 30%
  const slab6 = taxableIncome - 1500000;
  if (slab6 > 0) {
    const t = slab6 * 0.30;
    tax += t;
    slabs.push({ slab: 'Above 15,00,000', rate: '30%', tax: t });
  }

  return { tax, slabs };
}

function calculateSurcharge(tax, taxableIncome) {
  if (taxableIncome > 20000000) return tax * 0.25;
  if (taxableIncome > 10000000) return tax * 0.15;
  if (taxableIncome > 5000000) return tax * 0.10;
  return 0;
}

export function calculateTax(inputs) {
  const {
    basicSalary = 0,
    hraReceived = 0,
    otherAllowances = 0,
    monthlyRent = 0,
    isMetroCity = false,
    investments80C = 0,
    nps80CCD1B = 0,
    homeLoanInterest = 0,
    healthInsurance80D = 0,
    otherDeductions80G = 0,
    employerNPSContribution = 0,
  } = inputs;

  const grossSalary = basicSalary + hraReceived + otherAllowances;
  const annualRent = monthlyRent * 12;

  // ===================== OLD REGIME =====================
  const oldSteps = [];
  let oldRunning = grossSalary;
  let stepNum = 1;

  oldSteps.push({
    step: stepNum++, section: 'Gross Salary',
    description: `Basic (${fmtINR(basicSalary)}) + HRA (${fmtINR(hraReceived)}) + Others (${fmtINR(otherAllowances)})`,
    amount: grossSalary, runningTotal: oldRunning,
  });

  // Standard Deduction
  const oldStdDeduction = 50000;
  oldRunning -= oldStdDeduction;
  oldSteps.push({
    step: stepNum++, section: 'Sec 16(ia)',
    description: `Standard Deduction`,
    amount: -oldStdDeduction, runningTotal: oldRunning,
  });

  // HRA Exemption
  const hra = calculateHRAExemption(basicSalary, hraReceived, annualRent, isMetroCity);
  if (hra.exemption > 0) {
    oldRunning -= hra.exemption;
    oldSteps.push({
      step: stepNum++, section: 'Sec 10(13A)',
      description: `HRA Exemption — ${hra.reasoning}`,
      amount: -hra.exemption, runningTotal: oldRunning,
    });
  }

  // 80C
  const capped80C = Math.min(investments80C, 150000);
  if (capped80C > 0) {
    oldRunning -= capped80C;
    oldSteps.push({
      step: stepNum++, section: 'Sec 80C',
      description: `Investments (PPF, ELSS, LIC etc.) — capped at ₹1,50,000`,
      amount: -capped80C, runningTotal: oldRunning,
    });
  }

  // 80CCD(1B) NPS
  const capped80CCD1B = Math.min(nps80CCD1B, 50000);
  if (capped80CCD1B > 0) {
    oldRunning -= capped80CCD1B;
    oldSteps.push({
      step: stepNum++, section: 'Sec 80CCD(1B)',
      description: `Additional NPS contribution — capped at ₹50,000`,
      amount: -capped80CCD1B, runningTotal: oldRunning,
    });
  }

  // Section 24(b) Home Loan Interest
  const cappedHomeLoan = Math.min(homeLoanInterest, 200000);
  if (cappedHomeLoan > 0) {
    oldRunning -= cappedHomeLoan;
    oldSteps.push({
      step: stepNum++, section: 'Sec 24(b)',
      description: `Home Loan Interest — capped at ₹2,00,000 (self-occupied)`,
      amount: -cappedHomeLoan, runningTotal: oldRunning,
    });
  }

  // 80D Health Insurance
  const capped80D = Math.min(healthInsurance80D, 25000);
  if (capped80D > 0) {
    oldRunning -= capped80D;
    oldSteps.push({
      step: stepNum++, section: 'Sec 80D',
      description: `Health Insurance premium — capped at ₹25,000 (self + family)`,
      amount: -capped80D, runningTotal: oldRunning,
    });
  }

  // 80G Donations
  if (otherDeductions80G > 0) {
    oldRunning -= otherDeductions80G;
    oldSteps.push({
      step: stepNum++, section: 'Sec 80G',
      description: `Donations to eligible institutions`,
      amount: -otherDeductions80G, runningTotal: oldRunning,
    });
  }

  // 80CCD(2) Employer NPS
  const capped80CCD2 = Math.min(employerNPSContribution, basicSalary * 0.10);
  if (capped80CCD2 > 0) {
    oldRunning -= capped80CCD2;
    oldSteps.push({
      step: stepNum++, section: 'Sec 80CCD(2)',
      description: `Employer NPS contribution — capped at 10% of basic`,
      amount: -capped80CCD2, runningTotal: oldRunning,
    });
  }

  const oldTaxableIncome = Math.max(0, oldRunning);
  oldSteps.push({
    step: stepNum++, section: 'Taxable Income',
    description: 'Net taxable income after all deductions',
    amount: oldTaxableIncome, runningTotal: oldTaxableIncome,
  });

  const oldTaxResult = calculateOldRegimeTax(oldTaxableIncome);
  let oldTax = oldTaxResult.tax;

  // Rebate 87A — old regime
  if (oldTaxableIncome <= 500000) {
    oldTax = 0;
  }

  const oldSurcharge = calculateSurcharge(oldTax, oldTaxableIncome);
  const oldCess = (oldTax + oldSurcharge) * 0.04;
  const oldTotalTax = Math.round(oldTax + oldSurcharge + oldCess);

  // ===================== NEW REGIME =====================
  const newSteps = [];
  let newRunning = grossSalary;
  let newStepNum = 1;

  newSteps.push({
    step: newStepNum++, section: 'Gross Salary',
    description: `Basic + HRA + Others (No HRA exemption in new regime)`,
    amount: grossSalary, runningTotal: newRunning,
  });

  // New regime Standard Deduction (₹75,000 from FY2024-25)
  const newStdDeduction = 75000;
  newRunning -= newStdDeduction;
  newSteps.push({
    step: newStepNum++, section: 'Sec 16(ia)',
    description: `Standard Deduction (enhanced in new regime FY2024-25)`,
    amount: -newStdDeduction, runningTotal: newRunning,
  });

  // 80CCD(2) Employer NPS — allowed in new regime
  if (capped80CCD2 > 0) {
    newRunning -= capped80CCD2;
    newSteps.push({
      step: newStepNum++, section: 'Sec 80CCD(2)',
      description: `Employer NPS contribution — allowed in new regime`,
      amount: -capped80CCD2, runningTotal: newRunning,
    });
  }

  const newTaxableIncome = Math.max(0, newRunning);
  newSteps.push({
    step: newStepNum++, section: 'Taxable Income',
    description: 'Net taxable income (no 80C, 80D, HRA deductions in new regime)',
    amount: newTaxableIncome, runningTotal: newTaxableIncome,
  });

  const newTaxResult = calculateNewRegimeTax(newTaxableIncome);
  let newTax = newTaxResult.tax;

  // Rebate 87A — new regime
  if (newTaxableIncome <= 700000) {
    newTax = 0;
  }

  const newSurcharge = calculateSurcharge(newTax, newTaxableIncome);
  const newCess = (newTax + newSurcharge) * 0.04;
  const newTotalTax = Math.round(newTax + newSurcharge + newCess);

  // ===================== MISSED DEDUCTIONS =====================
  const missedDeductions = [];

  if (healthInsurance80D === 0) {
    const potentialSaving = oldTaxableIncome > 1000000 ? 7500 : oldTaxableIncome > 500000 ? 5000 : 0;
    missedDeductions.push({
      section: '80D', description: 'Health insurance premium',
      maxLimit: 25000, potentialSaving,
    });
  }

  if (nps80CCD1B === 0) {
    const potentialSaving = oldTaxableIncome > 1000000 ? 15000 : oldTaxableIncome > 500000 ? 10000 : 2500;
    missedDeductions.push({
      section: '80CCD(1B)', description: 'Additional NPS contribution',
      maxLimit: 50000, potentialSaving,
    });
  }

  if (otherDeductions80G === 0) {
    missedDeductions.push({
      section: '80G', description: 'Donations to eligible funds',
      maxLimit: 'As per actuals', potentialSaving: 'Varies',
    });
  }

  if (homeLoanInterest === 0) {
    missedDeductions.push({
      section: '24(b)', description: 'Home loan interest (if applicable)',
      maxLimit: 200000, potentialSaving: oldTaxableIncome > 1000000 ? 60000 : 40000,
    });
  }

  const recommendation = oldTotalTax <= newTotalTax ? 'old' : 'new';
  const savings = Math.abs(oldTotalTax - newTotalTax);

  return {
    oldRegime: {
      steps: oldSteps,
      slabs: oldTaxResult.slabs,
      taxableIncome: oldTaxableIncome,
      tax: oldTax,
      surcharge: oldSurcharge,
      cess: oldCess,
      totalTax: oldTotalTax,
      rebate87A: oldTaxableIncome <= 500000,
    },
    newRegime: {
      steps: newSteps,
      slabs: newTaxResult.slabs,
      taxableIncome: newTaxableIncome,
      tax: newTax,
      surcharge: newSurcharge,
      cess: newCess,
      totalTax: newTotalTax,
      rebate87A: newTaxableIncome <= 700000,
    },
    hraDetails: hra,
    recommendation,
    savings,
    missedDeductions,
  };
}
