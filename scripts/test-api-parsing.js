// scripts/test-api-parsing.js
// Tests the API response parsing logic using real data

const SAMPLE_API_RESPONSE = {
  "status": "ok",
  "data": {
    "CompanyID": { "dbname": "CompanyID", "label": "CompanyID", "type": "int" },
    "CompanyName": { "dbname": "CompanyName", "label": "Deal Name", "type": "text" },
    "URL": { "dbname": "URL", "label": "Website", "type": "url" },
    "StageID": {
      "dbname": "StageID",
      "label": "Stage",
      "type": "select",
      "optionlist": { "0": "Screening", "1": "Scheduling", "9": "Portfolio" }
    }
  }
};

// Same logic as src/lib/api.ts getSchema()
function parseSchema(response) {
  const dataObj = response.data || {};
  const rawFields = Object.values(dataObj);

  return rawFields.map(field => ({
    name: field.dbname || '',
    label: field.label || field.dbname,
    type: field.type,
    options: field.optionlist ? Object.keys(field.optionlist) : undefined,
    optionlistFull: field.optionlist
  }));
}

// Run test
console.log('Testing API response parsing...\n');

const fields = parseSchema(SAMPLE_API_RESPONSE);
console.log('Parsed fields count:', fields.length);
console.log('Fields:', JSON.stringify(fields, null, 2));
console.log('');

// Verify
let passed = 0;
let failed = 0;

if (fields.length === 4) {
  console.log('\u2713 PASS: Correct number of fields (4)');
  passed++;
} else {
  console.log('\u2717 FAIL: Expected 4 fields, got', fields.length);
  failed++;
}

if (fields.find(f => f.name === 'CompanyName')) {
  console.log('\u2713 PASS: CompanyName field found');
  passed++;
} else {
  console.log('\u2717 FAIL: CompanyName field not found');
  failed++;
}

const stageField = fields.find(f => f.name === 'StageID');
if (stageField && stageField.options && stageField.options.length === 3) {
  console.log('\u2713 PASS: StageID field has correct options');
  passed++;
} else {
  console.log('\u2717 FAIL: StageID options incorrect');
  failed++;
}

if (stageField && stageField.optionlistFull && stageField.optionlistFull['0'] === 'Screening') {
  console.log('\u2713 PASS: StageID optionlistFull preserved');
  passed++;
} else {
  console.log('\u2717 FAIL: StageID optionlistFull not preserved');
  failed++;
}

console.log('\n-------------------');
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
