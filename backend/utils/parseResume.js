const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

async function parseResumeFile(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();
                        
  if (ext === '.pdf') { 
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

module.exports = { parseResumeFile };
