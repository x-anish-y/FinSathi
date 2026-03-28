const fs = require('fs');
const { parseForm16Text } = require('./lib/form16Parser');

const sampleText = `
PART B (ANNEXURE)
Details of Salary Paid and any other income and tax deducted
1. Gross Salary
Component Amount (Rs.)
(a) Basic Salary 6,00,000
(b) House Rent Allowance (HRA) 2,40,000
(c) Special Allowance / Other Allowances 3,60,000
(d) Leave Travel Allowance (LTA) 50,000
(e) Bonus / Performance Pay 1,50,000

C. Summary of Tax Deducted at Source
Quarter Receipt No. Amount of Tax Deducted (Rs.) Amount of TDS Deposited (Rs.)
Q1 (Apr - Jun 2024) TDS-Q1-2024-002 38,500 38,500
TOTAL 1,54,050 1,54,050
`;

console.log("=== EXACT PARSE ===");
console.log(parseForm16Text(sampleText));

const sampleColumnText = `
PART B (ANNEXURE)
Details of Salary Paid and any other income and tax deducted
1. Gross Salary
Component Amount (Rs.)
(a) Basic Salary
(b) House Rent Allowance (HRA)
(c) Special Allowance / Other Allowances
(d) Leave Travel Allowance (LTA)
(e) Bonus / Performance Pay
6,00,000
2,40,000
3,60,000
50,000
1,50,000
`;

console.log("\n=== COLUMN PARSE ===");
console.log(parseForm16Text(sampleColumnText));
