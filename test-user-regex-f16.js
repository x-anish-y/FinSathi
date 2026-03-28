const fs = require('fs');

function extractForm16Fields(text) {
  function parseINR(str) {
    if (!str) return 0;
    const isNegative = str.includes('(') && str.includes(')');
    const clean = str.replace(/[₹()\s,]/g, '');
    return isNegative ? -parseFloat(clean) : parseFloat(clean) || 0;
  }
  
  function extract(pattern, fallback = 0) {
    const match = text.match(pattern);
    return match ? parseINR(match[1]) : fallback;
  }

  return {
    employeeName: (text.match(/Name of the Employee\s+(.+)/) || [])[1]?.trim() || '',
    employeePAN: (text.match(/PAN of the Employee\s+([A-Z]{5}\d{4}[A-Z])/) || [])[1] || '',
    employerName: (text.match(/Name of the Employer\s+(.+)/) || [])[1]?.trim() || '',
    financialYear: (text.match(/Financial Year\s+([\d-]+)/) || [])[1] || '2024-25',
    basicSalary: extract(/\(a\) Basic Salary\s+([\d,]+)/),
    hraReceived: extract(/\(b\) House Rent Allowance.*?([\d,]+)/),
    specialAllowance: extract(/\(c\) Special Allowance.*?([\d,]+)/),
    lta: extract(/\(d\) Leave Travel Allowance.*?([\d,]+)/),
    bonus: extract(/\(e\) Bonus.*?([\d,]+)/),
    totalGross: extract(/GROSS SALARY \[.*?\]\s+([\d,]+)/),
    hraExemptionAllowed: extract(/HRA EXEMPTION ALLOWED \(Minimum\)\s+Rs\.\s*([\d,]+)/i) ||
                         extract(/\(a\) HRA Exemption u\/s 10\(13A\).*?([\d,]+)\s*$/m),
    monthlyRentPaid: (() => {
      const rentMatch = text.match(/Monthly Rent Paid.*?Rs\.\s*([\d,]+)/i);
      return rentMatch ? parseINR(rentMatch[1]) : 0;
    })(),
    isMetroCity: (() => {
      const cityMatch = text.match(/City of Residence\s+(.+)/i);
      if (!cityMatch) return true;
      const city = cityMatch[1].toLowerCase();
      const metros = ['delhi', 'mumbai', 'kolkata', 'chennai', 'new delhi'];
      return metros.some(m => city.includes(m));
    })(),
    investments80C: extract(/80C\s+.+?([\d,]+)/),
    nps80CCD1B: extract(/80CCD\(1B\)\s+.+?([\d,]+)/),
    employerNPS80CCD2: extract(/80CCD\(2\)\s+.+?([\d,]+)/),
    healthInsurance80D: extract(/80D\s+.+?([\d,]+)/),
    donations80G: extract(/80G\s+.+?([\d,]+)/),
    homeLoanInterest24B: extract(/24\(b\)\s+.+?([\d,]+)/),
    totalDeductions: extract(/TOTAL DEDUCTIONS\s+([\d,]+)/),
    tdsByQuarter: (() => {
      const quarters = [];
      const qPattern = /Q(\d) \(.*?\)\s+TDS-Q\d-\d{4}-\d{3}\s+([\d,]+)\s+([\d,]+)/g;
      let m;
      while ((m = qPattern.exec(text)) !== null) {
        quarters.push({ quarter: m[1], deducted: parseINR(m[2]), deposited: parseINR(m[3]) });
      }
      return quarters;
    })(),
    totalTDS: extract(/TOTAL\s+([\d,]+)\s+[\d,]+/),
    isNewRegime: (() => {
      const regimeMatch = text.match(/new tax regime u\/s 115BAC\s*(YES|NO|yes|no)/i);
      if (regimeMatch) return regimeMatch[1].toUpperCase() === 'YES';
      return false;
    })(),
  };
}

const pdfText = fs.readFileSync('form16-raw.txt', 'utf8');
let cleanText = pdfText;
const verificationIndex = cleanText.indexOf('VERIFICATION / DECLARATION');
if (verificationIndex > -1) {
  cleanText = cleanText.substring(0, verificationIndex);
}

const result = extractForm16Fields(cleanText);
console.log("Form16 Output:", JSON.stringify(result, null, 2));
