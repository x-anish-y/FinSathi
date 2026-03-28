/**
 * XIRR Calculator — Wrapper around the xirr npm package
 */

export function calculateXIRR(transactions) {
  try {
    if (!transactions || transactions.length < 2) {
      return { xirr: null, error: 'Insufficient transaction data for XIRR calculation' };
    }

    // Newton's method for XIRR
    const daysBetween = (d1, d2) => (d2 - d1) / (365.25 * 24 * 60 * 60 * 1000);

    function xirrFunc(rate) {
      let result = 0;
      const firstDate = transactions[0].when;
      for (const t of transactions) {
        const years = daysBetween(firstDate, t.when);
        result += t.amount / Math.pow(1 + rate, years);
      }
      return result;
    }

    function xirrDerivative(rate) {
      let result = 0;
      const firstDate = transactions[0].when;
      for (const t of transactions) {
        const years = daysBetween(firstDate, t.when);
        if (years !== 0) {
          result -= years * t.amount / Math.pow(1 + rate, years + 1);
        }
      }
      return result;
    }

    let rate = 0.1;
    const maxIterations = 100;
    const tolerance = 1e-7;

    for (let i = 0; i < maxIterations; i++) {
      const fValue = xirrFunc(rate);
      const fDerivative = xirrDerivative(rate);

      if (Math.abs(fDerivative) < 1e-10) break;

      const newRate = rate - fValue / fDerivative;

      if (Math.abs(newRate - rate) < tolerance) {
        return { xirr: newRate, percentage: (newRate * 100).toFixed(2) + '%', error: null };
      }

      rate = newRate;

      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }

    return { xirr: rate, percentage: (rate * 100).toFixed(2) + '%', error: null };
  } catch (error) {
    return { xirr: null, percentage: null, error: 'XIRR calculation failed: ' + error.message };
  }
}

export function calculateAbsoluteReturn(invested, currentValue) {
  if (invested <= 0) return 0;
  return ((currentValue - invested) / invested * 100).toFixed(2);
}

export function calculateCAGR(invested, currentValue, years) {
  if (invested <= 0 || years <= 0) return 0;
  return ((Math.pow(currentValue / invested, 1 / years) - 1) * 100).toFixed(2);
}
