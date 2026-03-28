/**
 * MF Overlap Detection + Expense Ratio Drag Calculator
 */

const FUND_HOLDINGS = {
  'Mirae Asset Large Cap Fund': { category: 'Large Cap', expenseRegular: 1.62, expenseDirect: 0.53, holdings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'Bharti Airtel', 'TCS', 'ITC', 'L&T', 'Axis Bank', 'SBI'] },
  'SBI Blue Chip Fund': { category: 'Large Cap', expenseRegular: 1.56, expenseDirect: 0.78, holdings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'TCS', 'Bharti Airtel', 'L&T', 'M&M', 'SBI', 'HUL'] },
  'Axis Bluechip Fund': { category: 'Large Cap', expenseRegular: 1.64, expenseDirect: 0.49, holdings: ['HDFC Bank', 'Bajaj Finance', 'TCS', 'Infosys', 'Kotak Bank', 'Avenue Supermarts', 'Cipla', 'Maruti Suzuki', 'Nestle', 'HUL'] },
  'HDFC Top 100 Fund': { category: 'Large Cap', expenseRegular: 1.78, expenseDirect: 1.03, holdings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'ITC', 'L&T', 'Bharti Airtel', 'TCS', 'SBI', 'Axis Bank'] },
  'Parag Parikh Flexi Cap Fund': { category: 'Flexi Cap', expenseRegular: 1.64, expenseDirect: 0.63, holdings: ['HDFC Bank', 'ICICI Bank', 'Bajaj Holdings', 'ITC', 'Power Grid', 'Coal India', 'Alphabet', 'Microsoft', 'Amazon', 'Meta'] },
  'UTI Nifty 50 Index Fund': { category: 'Index', expenseRegular: 0.30, expenseDirect: 0.18, holdings: ['HDFC Bank', 'Reliance Industries', 'ICICI Bank', 'Infosys', 'TCS', 'Bharti Airtel', 'ITC', 'L&T', 'SBI', 'Kotak Bank'] },
  'Nippon India Large Cap Fund': { category: 'Large Cap', expenseRegular: 1.68, expenseDirect: 0.78, holdings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'ITC', 'Infosys', 'L&T', 'Bharti Airtel', 'Maruti Suzuki', 'TCS', 'HUL'] },
  'ICICI Pru Bluechip Fund': { category: 'Large Cap', expenseRegular: 1.64, expenseDirect: 0.89, holdings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'L&T', 'Bharti Airtel', 'TCS', 'SBI', 'M&M', 'ITC'] },
  'HDFC Mid Cap Opportunities': { category: 'Mid Cap', expenseRegular: 1.74, expenseDirect: 0.78, holdings: ['Indian Hotels', 'Max Healthcare', 'AU Small Finance', 'Persistent Systems', 'Coforge', 'Trent', 'Sundaram Finance', 'Tube Investments', 'BSE Ltd', 'Cummins'] },
  'Axis Midcap Fund': { category: 'Mid Cap', expenseRegular: 1.73, expenseDirect: 0.51, holdings: ['Persistent Systems', 'Cholamandalam', 'APL Apollo', 'PI Industries', 'Page Industries', 'Astral', 'Mphasis', 'AU Small Finance', 'Dalmia Bharat', 'CG Power'] },
  'SBI Small Cap Fund': { category: 'Small Cap', expenseRegular: 1.72, expenseDirect: 0.64, holdings: ['Blue Star', 'Kalyan Jewellers', 'CDSL', 'Finolex Cables', 'Chalet Hotels', 'CAMS', 'Praj Industries', 'CMS Info', 'Radico Khaitan', 'Carborundum'] },
  'HDFC Flexi Cap Fund': { category: 'Flexi Cap', expenseRegular: 1.57, expenseDirect: 0.77, holdings: ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Cipla', 'Bharti Airtel', 'HCL Tech', 'Maruti Suzuki', 'ITC', 'Coal India'] },
  'Canara Robeco Bluechip': { category: 'Large Cap', expenseRegular: 1.70, expenseDirect: 0.42, holdings: ['HDFC Bank', 'ICICI Bank', 'Reliance Industries', 'Infosys', 'TCS', 'Bharti Airtel', 'ITC', 'SBI', 'L&T', 'HUL'] },
  'Tata Digital India Fund': { category: 'IT Sector', expenseRegular: 1.84, expenseDirect: 0.31, holdings: ['Infosys', 'TCS', 'HCL Tech', 'Wipro', 'Tech Mahindra', 'LTIMindtree', 'Persistent Systems', 'Mphasis', 'Coforge', 'KPIT Tech'] },
};

export function detectOverlap(userFunds) {
  const stockExposure = {};
  const overlapMatrix = {};
  const totalValue = userFunds.reduce((s, f) => s + (f.currentValue || f.invested || 100000), 0);

  userFunds.forEach((fund) => {
    const fundInfo = findFundInfo(fund.name);
    if (!fundInfo) return;
    const weight = (fund.currentValue || fund.invested || 100000) / totalValue;
    fundInfo.holdings.forEach((stock, idx) => {
      const sw = ((10 - idx) / 55) * weight * 100;
      if (!stockExposure[stock]) stockExposure[stock] = { funds: [], totalWeight: 0 };
      stockExposure[stock].funds.push({ fundName: fund.name, weight: sw.toFixed(1) });
      stockExposure[stock].totalWeight += sw;
    });
  });

  for (let i = 0; i < userFunds.length; i++) {
    for (let j = i + 1; j < userFunds.length; j++) {
      const f1 = findFundInfo(userFunds[i].name), f2 = findFundInfo(userFunds[j].name);
      if (!f1 || !f2) continue;
      const common = f1.holdings.filter(h => f2.holdings.includes(h));
      const pct = (common.length / Math.max(f1.holdings.length, f2.holdings.length)) * 100;
      overlapMatrix[`${userFunds[i].name} × ${userFunds[j].name}`] = { overlap: Math.round(pct), commonStocks: common };
    }
  }

  const highExposure = Object.entries(stockExposure)
    .filter(([, d]) => d.totalWeight > 8)
    .sort(([, a], [, b]) => b.totalWeight - a.totalWeight)
    .map(([stock, d]) => ({ stock, ...d, totalWeight: +d.totalWeight.toFixed(1) }));

  return { stockExposure, overlapMatrix, highExposure };
}

export function calculateExpenseRatioDrag(fundName, corpus, years = 10, benchReturn = 0.12) {
  const fi = findFundInfo(fundName);
  if (!fi) return null;
  const rr = benchReturn - fi.expenseRegular / 100;
  const dr = benchReturn - fi.expenseDirect / 100;
  const rfv = corpus * Math.pow(1 + rr, years);
  const dfv = corpus * Math.pow(1 + dr, years);
  return { fundName, regularExpense: fi.expenseRegular, directExpense: fi.expenseDirect, regularFV: Math.round(rfv), directFV: Math.round(dfv), dragAmount: Math.round(dfv - rfv), dragPercent: (((dfv - rfv) / rfv) * 100).toFixed(1) };
}

export function getSTCGAnalysis(fund, purchaseDate) {
  const now = new Date(), pd = new Date(purchaseDate);
  const days = (now - pd) / 864e5;
  const end = new Date(pd); end.setFullYear(end.getFullYear() + 1);
  const isSTCG = days < 365;
  return { fundName: fund.name, purchaseDate: pd.toISOString().split('T')[0], isSTCG, daysHeld: Math.round(days), stcgEndDate: end.toISOString().split('T')[0], taxRate: isSTCG ? '20%' : '12.5% (LTCG above ₹1.25L)', recommendation: isSTCG ? `Do NOT sell units purchased on ${pd.toLocaleDateString('en-IN')} until ${end.toLocaleDateString('en-IN')}. Stop fresh SIPs and redirect.` : 'LTCG applies. Safe to rebalance.' };
}

function findFundInfo(name) {
  if (FUND_HOLDINGS[name]) return FUND_HOLDINGS[name];
  const ln = name.toLowerCase();
  for (const [k, v] of Object.entries(FUND_HOLDINGS)) {
    const parts = k.toLowerCase().split(' ');
    if (parts.filter(p => ln.includes(p)).length >= 2) return v;
  }
  return null;
}

export { FUND_HOLDINGS };
