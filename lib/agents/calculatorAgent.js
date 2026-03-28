/**
 * Calculator Agent — Dispatches to appropriate calculation engine
 */

import { calculateHealthScore, getWeakestDimensions } from '@/lib/calculators/healthScorer';
import { calculateFirePlan } from '@/lib/calculators/fireCalculator';
import { calculateTax } from '@/lib/calculators/taxCalculator';
import { calculateXIRR } from '@/lib/calculators/xirrCalculator';
import { detectOverlap, calculateExpenseRatioDrag, getSTCGAnalysis } from '@/lib/calculators/mfOverlap';
import { optimizeCoupleFinances } from '@/lib/calculators/coupleOptimizer';

export function runCalculation(module, data) {
  switch (module) {
    case 'health-score': {
      const { scores, totalScore } = calculateHealthScore(data);
      const weakest = getWeakestDimensions(scores);
      return { scores, totalScore, weakest };
    }
    case 'fire-planner':
      return calculateFirePlan(data);
    case 'tax-wizard':
      return calculateTax(data);
    case 'mf-xray': {
      const overlap = detectOverlap(data.funds || []);
      const expenseAnalysis = (data.funds || []).map(f => calculateExpenseRatioDrag(f.name, f.currentValue || f.invested || 100000));
      const stcgAnalysis = (data.funds || []).filter(f => f.purchaseDate).map(f => getSTCGAnalysis(f, f.purchaseDate));
      const xirrResult = data.transactions ? calculateXIRR(data.transactions) : null;
      return { overlap, expenseAnalysis: expenseAnalysis.filter(Boolean), stcgAnalysis, xirrResult };
    }
    case 'couples-planner':
      return optimizeCoupleFinances(data.partnerA, data.partnerB, data.sharedGoals);
    default:
      throw new Error(`Unknown module: ${module}`);
  }
}
