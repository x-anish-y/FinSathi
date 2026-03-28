const fs = require('fs');
const path = require('path');

async function testPdfUpload() {
  const form16Path = path.join('c:', 'Users', 'Anish', 'Downloads', 'ET', 'Sample_Form16.pdf');
  const camsPath = path.join('c:', 'Users', 'Anish', 'Downloads', 'ET', 'CAMS_CAS_Sample.pdf');

  console.log("=== Testing Form 16 Upload ===");
  try {
    const form16Data = new FormData();
    const form16Buffer = fs.readFileSync(form16Path);
    form16Data.append('file', new Blob([form16Buffer], { type: 'application/pdf' }), 'Sample_Form16.pdf');

    const form16Res = await fetch('http://localhost:3000/api/tax-wizard/upload', {
      method: 'POST',
      body: form16Data
    });

    const form16Output = await form16Res.json();
    fs.writeFileSync('form16-out.json', JSON.stringify(form16Output, null, 2));
    console.log("Form 16 Output written to form16-out.json. Success:", form16Output.success || form16Output.error);
  } catch (err) {
    console.error("Form 16 Test Error:", err);
  }

  console.log("\n=== Testing MF X-Ray Upload ===");
  try {
    const camsData = new FormData();
    const camsBuffer = fs.readFileSync(camsPath);
    camsData.append('file', new Blob([camsBuffer], { type: 'application/pdf' }), 'CAMS_CAS_Sample.pdf');

    const camsRes = await fetch('http://localhost:3000/api/mf-xray/upload', {
      method: 'POST',
      body: camsData
    });

    const camsOutput = await camsRes.json();
    fs.writeFileSync('cams-out.json', JSON.stringify(camsOutput, null, 2));
    console.log("MF X-Ray Output written to cams-out.json. Success:", camsOutput.success || camsOutput.error);
  } catch (err) {
    console.error("MF Test Error:", err);
  }
}

testPdfUpload();
