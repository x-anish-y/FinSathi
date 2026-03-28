const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function dumpRawText() {
  const form16Path = path.join('c:', 'Users', 'Anish', 'Downloads', 'ET', 'Sample_Form16.pdf');
  const camsPath = path.join('c:', 'Users', 'Anish', 'Downloads', 'ET', 'CAMS_CAS_Sample.pdf');

  try {
    const f16Buffer = fs.readFileSync(form16Path);
    const f16Data = await pdfParse(f16Buffer);
    fs.writeFileSync('form16-raw.txt', f16Data.text);
    console.log("Form16 dumped.");
  } catch (err) { console.error(err); }

  try {
    const camsBuffer = fs.readFileSync(camsPath);
    const camsData = await pdfParse(camsBuffer);
    fs.writeFileSync('cams-raw.txt', camsData.text);
    console.log("CAMS dumped.");
  } catch (err) { console.error(err); }
}

dumpRawText();
