/**
 * AI Advisor Agent — OpenAI prompt engineering for each module
 */

import { getAIResponse, getJSONResponse } from '@/lib/openai';

const SYSTEM_PROMPT = `You are a SEBI-compliant financial wellness coach for Indian retail investors. You provide actionable, specific advice with rupee amounts and timelines. Never recommend specific stocks or mutual fund schemes. Always remind that this is guidance, not licensed financial advice. The current year is 2026. Do NOT suggest actions for 2024 or 2025.`;

export async function getHealthScoreAdvice(scores) {
  const prompt = `The user's financial health scores are: ${JSON.stringify(scores)}. Write exactly 3 prioritized action items, starting with the lowest-scoring dimension. Each action item must be specific, actionable, and include a rupee amount or timeline. Keep each action item under 40 words. Return as JSON: {"actions": [{"priority": 1, "dimension": "", "action": "", "impact": ""}]}`;
  try {
    return await getJSONResponse(SYSTEM_PROMPT, prompt);
  } catch (e) {
    return { actions: [{ priority: 1, dimension: 'general', action: 'AI narrative temporarily unavailable. Focus on your lowest-scoring dimensions.', impact: 'Review scores above.' }], error: e.message };
  }
}

export async function getFirePlanAdvice(planData) {
  const prompt = `The user is ${planData.yearsToRetirement} years from retirement. Required corpus: ₹${(planData.requiredCorpus / 10000000).toFixed(1)}Cr. Projected: ₹${(planData.totalProjected / 10000000).toFixed(1)}Cr. Shortfall: ₹${(planData.shortfall / 10000000).toFixed(1)}Cr. Additional SIP needed: ₹${planData.additionalSIPNeeded?.toLocaleString('en-IN')}/month. Savings rate: ${planData.savingsRate}%. Write a personalized 3-paragraph FIRE plan with specific monthly amounts, asset allocation advice, and a realistic timeline. Keep it under 200 words. Be encouraging but honest.`;
  try {
    return await getAIResponse(SYSTEM_PROMPT, prompt);
  } catch (e) {
    return 'AI narrative temporarily unavailable. Please review the calculation results above for your FIRE plan details.';
  }
}

export async function getTaxAdvice(taxResults) {
  const prompt = `Old regime tax: ₹${taxResults.oldRegime.totalTax.toLocaleString('en-IN')}. New regime tax: ₹${taxResults.newRegime.totalTax.toLocaleString('en-IN')}. Recommended: ${taxResults.recommendation} regime. Savings: ₹${taxResults.savings.toLocaleString('en-IN')}. Missed deductions: ${JSON.stringify(taxResults.missedDeductions)}. Write a concise tax optimization summary (under 100 words) with 2-3 specific actions the user can take to save more tax. Focus on missed deductions.`;
  try {
    return await getAIResponse(SYSTEM_PROMPT, prompt);
  } catch (e) {
    return 'AI narrative temporarily unavailable. Review the regime comparison and missed deductions above.';
  }
}

export async function getMFAdvice(analysisData) {
  const prompt = `The user's MF portfolio has these issues: ${analysisData.overlap?.highExposure?.length || 0} stocks with >8% concentration. Overlap matrix: ${JSON.stringify(Object.entries(analysisData.overlap?.overlapMatrix || {}).slice(0, 3))}. Write 3 specific rebalancing recommendations. Mention fund names and actions (stop SIP, switch, hold). Under 150 words.`;
  try {
    return await getAIResponse(SYSTEM_PROMPT, prompt);
  } catch (e) {
    return 'AI narrative temporarily unavailable. Review the overlap analysis and expense ratio comparison above.';
  }
}

export async function getCoupleAdvice(coupleData) {
  const prompt = `Couple's financial summary: ${JSON.stringify({ hraOpt: coupleData.hraOptimization?.recommendation, taxBracket: coupleData.taxBracketOptimization?.fdRecommendation, nps: coupleData.jointNPS?.summary, netWorth: coupleData.combinedNetWorth?.netWorth })}. Write a concise joint financial plan (under 120 words) with 3 specific actions for the couple.`;
  try {
    return await getAIResponse(SYSTEM_PROMPT, prompt);
  } catch (e) {
    return 'AI narrative temporarily unavailable. Review the optimization recommendations above.';
  }
}

export async function extractForm16Fields(pdfText) {
  const systemPrompt = `You are an expert Indian tax document parser specializing in Form 16 issued by employers under Section 203 of the Income Tax Act.

Form 16 has two parts:
- **Part A**: Contains TAN, PAN, employer details, and quarterly TDS breakup (amount deducted and deposited).
- **Part B** (Annexure): Contains the detailed salary computation with a table of components:
  - Gross Salary breakdown: (a) Basic Salary, (b) House Rent Allowance (HRA), (c) Special Allowance / Other Allowances, (d) Leave Travel Allowance (LTA), (e) Bonus / Performance Pay, etc.
  - Section 17(1): Salary as per provisions (total of all above components)
  - Section 17(2): Perquisites
  - Section 17(3): Profits in lieu of salary
  - Allowances exempt under Section 10 (HRA exemption u/s 10(13A), LTA u/s 10(5), etc.)
  - Standard Deduction u/s 16(ia): ₹50,000 or ₹75,000
  - Professional Tax u/s 16(iii)
  - Chapter VI-A deductions: 80C, 80CCC, 80CCD(1), 80CCD(1B), 80CCD(2), 80D, 80E, 80G, 80TTA/80TTB, etc.
  - Section 24(b): Interest on home loan
  - Total income and tax computation

CRITICAL RULES:
1. Extract EXACT numerical values as they appear in the document. Do NOT compute, sum, or estimate.
2. Indian number format uses commas differently: 6,00,000 = 600000, 1,54,050 = 154050
3. Convert all Indian-formatted numbers to plain integers (no commas).
4. For "basicSalary", look for the line labeled "(a) Basic Salary" in the Gross Salary table, NOT the Section 17(1) total.
5. For "hraReceived", look for "(b) House Rent Allowance (HRA)" in the Gross Salary table.
6. For "otherAllowances", SUM up all remaining salary components: Special Allowance, LTA, Bonus, Performance Pay, and any other allowances listed.
7. Return ONLY valid JSON, no markdown.`;

  const prompt = `Extract the following fields from this Form 16 PDF text. Return ONLY a valid JSON object with integer values (no commas, no strings).

{
  "basicSalary": <(a) Basic Salary from the Gross Salary table>,
  "hraReceived": <(b) House Rent Allowance (HRA) from the Gross Salary table>,
  "otherAllowances": <Sum of all other salary components like Special Allowance, LTA, Bonus, Performance Pay>,
  "totalGross": <Gross Total Income or Total Income>,
  "tdsDeducted": <Total TDS deducted / Total Tax Deducted at Source from Part A>,
  "standardDeduction": <Standard deduction u/s 16(ia), typically 50000 or 75000>,
  "professionalTax": <Professional tax u/s 16(iii)>,
  "investments_80c": <Deduction under sections 80C + 80CCC + 80CCD(1) combined>,
  "nps_80ccd": <Deduction under section 80CCD(1B) for additional NPS>,
  "employerNPS_80ccd2": <Employer NPS contribution under 80CCD(2)>,
  "healthInsurance_80d": <Deduction under section 80D>,
  "homeLoanInterest": <Interest on housing loan under Section 24(b)>,
  "otherDeductions": <Sum of any other Chapter VI-A deductions: 80E, 80G, 80TTA, etc.>,
  "totalChapterVIA": <Total deductions under Chapter VI-A>
}

FULL Form 16 Text:
${pdfText}`;

  try {
    const result = await getJSONResponse(systemPrompt, prompt, { maxTokens: 2048, temperature: 0.1 });
    console.log('[Form16 Extraction] AI returned:', JSON.stringify(result));
    return result;
  } catch (e) {
    console.error('[Form16 Extraction] OpenAI extraction failed:', e.message);
    return null;
  }
}
