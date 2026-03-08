/**
 * Extract real market data from Excel and generate value.json + volume.json
 * Source: Copy of Dataset-Global Conveyors  Handling Market.xlsx
 *
 * FIX 1: Sub-region sections (GCC, South Africa, Rest of MEA) were overwriting
 *         geo-level totals. Added inSubRegionSection flag to skip them.
 * FIX 2: Conveyors is a parent in segmentation_analysis.json, so it must be a
 *         parent in value.json too (with L3 Belt/Roller/Chain/Wheel children).
 */
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const FILE = 'Copy of Dataset-Global Conveyors  Handling Market.xlsx';
const YEARS = ['2021','2022','2023','2024','2025','2026','2027','2028','2029','2030','2031','2032','2033'];
const GEOS = ['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];

// L2 children of Transport Equipment
const TRANSPORT_L2_PARENTS = new Set([
  'Industrial Trucks', 'Automated Guided Vehicles (AGVs / AMRs)',
  'Cranes', 'Others (Hoppers, Reclaimers)'
]);

// L3 children of Conveyors (nested under Conveyors in value.json)
const CONVEYORS_L3 = new Set([
  'Belt Conveyors', 'Chain Conveyors', 'Others (Vertical, Screw, Pneumatic, Bucket)',
  'Roller Conveyors', 'Wheel Conveyors'
]);

const EQUIP_L1_STANDALONE = new Set([
  'Handling Equipment', 'Racking & Storage Equipment',
  'Others (Unit Load Formation, Identification & Control Equipment)'
]);

const AUTOMATION_SEGS = new Set(['Manual Equipment', 'Semi Automatic & Automatic Equipment']);
const INTEGRATION_SEGS = new Set(['Standalone Systems', 'Integrated Systems']);
const INDUSTRY_SEGS = new Set([
  'Consumer Goods & Electronics', 'Automotive', 'Food & Beverages',
  'Pharmaceutical', 'Construction', 'Mining', 'Semiconductors', 'Aviation',
  'Others (Chemicals, Agriculture, Metals & Steel, Paper & Pulp, etc.)'
]);
const REGION_SEGS = new Set(['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa']);

function isGeoHeader(row) {
  var name = String(row[0] || '').trim();
  if (GEOS.indexOf(name) < 0) return false;
  for (var i = 1; i <= 13; i++) {
    var v = row[i];
    if (v !== '' && v !== 0 && v !== null && v !== undefined) return false;
  }
  return true;
}

function hasYearValues(row) {
  for (var i = 1; i <= 13; i++) {
    if (typeof row[i] === 'number' && row[i] > 0) return true;
  }
  return false;
}

function hasEmptyYears(row) {
  for (var i = 1; i <= 13; i++) {
    var v = row[i];
    if (v !== '' && v !== 0 && v !== null && v !== undefined) return false;
  }
  return true;
}

function extractYears(row, roundFn) {
  var vals = {};
  YEARS.forEach(function(y, idx) {
    var v = row[idx + 1];
    vals[y] = roundFn(typeof v === 'number' ? v : parseFloat(v) || 0);
  });
  return vals;
}

function parseSheet(sheetName, roundFn) {
  var wb = xlsx.readFile(FILE);
  var sheet = wb.Sheets[sheetName];
  var rows = xlsx.utils.sheet_to_json(sheet, {header:1, defval:''});

  var result = {};
  var currentGeo = null;
  var currentSegType = null;
  var inCountrySection = false;
  var inSubRegionSection = false; // FIX 1: skip sub-region data sections

  rows.forEach(function(row) {
    var name = String(row[0] || '').trim();
    if (!name) return;

    // Geo header detection (known geos with empty year values)
    if (isGeoHeader(row)) {
      currentGeo = name;
      currentSegType = null;
      inCountrySection = false;
      inSubRegionSection = false; // Reset on new real geo
      if (!result[currentGeo]) {
        result[currentGeo] = {};
      }
      return;
    }

    if (!currentGeo) return;

    // FIX 1: Detect sub-region section headers (e.g. "GCC", "South Africa",
    // "Rest of Middle East & Africa") — rows with empty year values that are
    // NOT a known geo and NOT a "By X" segment type.
    // These appear after the geo-level totals and contain sub-region breakdowns
    // that would overwrite the correct geo totals.
    if (hasEmptyYears(row) && name.indexOf('By ') !== 0 && GEOS.indexOf(name) < 0) {
      inSubRegionSection = true;
      return;
    }

    // Skip all rows inside sub-region sections
    if (inSubRegionSection) return;

    // Segment type detection
    if (name === 'By Country') {
      inCountrySection = true;
      return;
    }

    if (name.indexOf('By ') === 0) {
      var segType = name;
      inCountrySection = false;
      if (segType === 'By Equipment Type' || segType === 'By Automation Level' ||
          segType === 'By System Integration' || segType === 'By End-Use Industry' ||
          segType === 'By Region') {
        currentSegType = segType;
        if (!result[currentGeo][currentSegType]) {
          result[currentGeo][currentSegType] = {};
        }
      }
      return;
    }

    // Skip country rows
    if (inCountrySection) return;
    if (!currentSegType) return;
    if (!hasYearValues(row)) return;

    var yearVals = extractYears(row, roundFn);

    if (currentSegType === 'By Equipment Type') {
      if (name === 'Transport Equipment') {
        // Parent object — don't store direct values, but ensure it's an object
        if (!result[currentGeo][currentSegType]['Transport Equipment']) {
          result[currentGeo][currentSegType]['Transport Equipment'] = {};
        }
        return;
      }

      // FIX 2: Conveyors is also a parent (has L3 children in segmentation_analysis.json)
      if (name === 'Conveyors') {
        if (!result[currentGeo][currentSegType]['Transport Equipment']) {
          result[currentGeo][currentSegType]['Transport Equipment'] = {};
        }
        if (!result[currentGeo][currentSegType]['Transport Equipment']['Conveyors']) {
          result[currentGeo][currentSegType]['Transport Equipment']['Conveyors'] = {};
        }
        return; // Don't store Conveyors itself as a leaf — let L3 children fill it
      }

      // L3: Belt/Roller/Chain/Wheel — nest under Conveyors
      if (CONVEYORS_L3.has(name)) {
        var te = result[currentGeo][currentSegType]['Transport Equipment'];
        if (!te) { te = {}; result[currentGeo][currentSegType]['Transport Equipment'] = te; }
        if (!te['Conveyors']) te['Conveyors'] = {};
        te['Conveyors'][name] = yearVals;
        return;
      }

      // Other L2 children of Transport Equipment
      if (TRANSPORT_L2_PARENTS.has(name)) {
        if (!result[currentGeo][currentSegType]['Transport Equipment']) {
          result[currentGeo][currentSegType]['Transport Equipment'] = {};
        }
        result[currentGeo][currentSegType]['Transport Equipment'][name] = yearVals;
        return;
      }

      // L1 standalone items
      if (EQUIP_L1_STANDALONE.has(name)) {
        result[currentGeo][currentSegType][name] = yearVals;
        return;
      }
      return;
    }

    if (currentSegType === 'By Automation Level') {
      if (AUTOMATION_SEGS.has(name)) result[currentGeo][currentSegType][name] = yearVals;
      return;
    }
    if (currentSegType === 'By System Integration') {
      if (INTEGRATION_SEGS.has(name)) result[currentGeo][currentSegType][name] = yearVals;
      return;
    }
    if (currentSegType === 'By End-Use Industry') {
      if (INDUSTRY_SEGS.has(name)) result[currentGeo][currentSegType][name] = yearVals;
      return;
    }
    if (currentSegType === 'By Region') {
      if (REGION_SEGS.has(name)) result[currentGeo][currentSegType][name] = yearVals;
      return;
    }
  });

  // Remove "By Region" from non-Global geos
  GEOS.forEach(function(geo) {
    if (geo !== 'Global' && result[geo] && result[geo]['By Region']) {
      delete result[geo]['By Region'];
    }
  });

  return result;
}

var r2 = function(n) { return Math.round(n * 100) / 100; };
var r0 = function(n) { return Math.round(n); };

console.log('Extracting Value data...');
var valueData = parseSheet('Value', r2);
console.log('Extracting Volume data...');
var volumeData = parseSheet('Volume', r0);

// ===== VERIFICATION =====
console.log('\n--- VERIFICATION ---');
var g = valueData['Global'];

// Check Conveyors is now nested with L3 children
var te = g['By Equipment Type']['Transport Equipment'];
console.log('Conveyors children:', Object.keys(te['Conveyors']));
var conveyors2025Sum = Object.values(te['Conveyors']).reduce(function(s, v) {
  return s + (v['2025'] || 0);
}, 0);
console.log('Conveyors L3 sum 2025:', conveyors2025Sum, '(Excel: 81852.76)');

// Check MEA is now correct
var mea = valueData['Middle East & Africa'];
if (mea && mea['By Automation Level']) {
  var manual = mea['By Automation Level']['Manual Equipment'];
  var semiauto = mea['By Automation Level']['Semi Automatic & Automatic Equipment'];
  console.log('MEA Manual 2025:', manual && manual['2025'], '(Excel: 1822.36)');
  console.log('MEA Semi Auto 2025:', semiauto && semiauto['2025'], '(Excel: 12232.96)');
  var meaSum = (manual && manual['2025'] || 0) + (semiauto && semiauto['2025'] || 0);
  console.log('MEA Automation sum 2025:', meaSum, '(expected ~14055.32)');
}

// Check all geos
console.log('\nValue geos:', Object.keys(valueData));
console.log('Volume geos:', Object.keys(volumeData));
Object.keys(valueData).forEach(function(geo) {
  console.log(geo, '->', Object.keys(valueData[geo]));
});

var outDir = path.join(__dirname, 'public', 'data');
fs.writeFileSync(path.join(outDir, 'value.json'), JSON.stringify(valueData, null, 2));
fs.writeFileSync(path.join(outDir, 'volume.json'), JSON.stringify(volumeData, null, 2));
console.log('\n✅ value.json and volume.json written!');
console.log('   value.json:', Math.round(JSON.stringify(valueData).length / 1024), 'KB');
console.log('   volume.json:', Math.round(JSON.stringify(volumeData).length / 1024), 'KB');
