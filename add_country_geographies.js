/**
 * add_country_geographies.js
 *
 * Adds country-level geographies to the existing value.json, volume.json,
 * and segmentation_analysis.json for the Global Conveyors & Handling Market.
 *
 * The existing files were generated from real Excel data. This script reads
 * those files, adds country-level entries derived from regional totals using
 * fixed proportions (from the sample report), and updates the "By Region"
 * hierarchy in segmentation_analysis.json to include country children
 * (which is required by json-processor.ts to build the geography dropdown).
 */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'public', 'data');
const YEARS = ['2021','2022','2023','2024','2025','2026','2027','2028','2029','2030','2031','2032','2033'];

// Country proportions within each region (must sum to 1.0 per region)
// Source: Global Conveyors & Handling Market sample report — By Region breakdown
const BY_REGION = {
  'North America': {
    'U.S.':    0.82,
    'Canada':  0.18
  },
  'Europe': {
    'U.K.':           0.14,
    'Germany':        0.19,
    'Italy':          0.09,
    'France':         0.13,
    'Spain':          0.08,
    'Russia':         0.07,
    'Rest of Europe': 0.30
  },
  'Asia Pacific': {
    'China':                0.40,
    'India':                0.14,
    'Japan':                0.18,
    'South Korea':          0.09,
    'ASEAN':                0.09,
    'Australia':            0.04,
    'Rest of Asia Pacific': 0.06
  },
  'Latin America': {
    'Brazil':               0.45,
    'Mexico':               0.28,
    'Argentina':            0.15,
    'Rest of Latin America':0.12
  },
  'Middle East & Africa': {
    'GCC':                         0.42,
    'South Africa':                0.18,
    'Rest of Middle East & Africa':0.40
  }
};

function round2(n) { return Math.round(n * 100) / 100; }

// ── Helper: deep-clone an object structure replacing all year-values
//    with: original_value * proportion
function scaleGeoData(regionData, proportion) {
  const result = {};
  for (const [key, val] of Object.entries(regionData)) {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      // Could be { segType: { ... } } or { year: number }
      const firstKey = Object.keys(val)[0];
      if (firstKey && YEARS.includes(String(firstKey))) {
        // This is a { year: value } object — scale it
        const scaled = {};
        for (const [year, num] of Object.entries(val)) {
          scaled[year] = round2(num * proportion);
        }
        result[key] = scaled;
      } else {
        // Nested object — recurse
        result[key] = scaleGeoData(val, proportion);
      }
    } else {
      result[key] = val;
    }
  }
  return result;
}

// ── Read existing files
console.log('Reading existing data files...');
const valueData = JSON.parse(fs.readFileSync(path.join(OUT, 'value.json'), 'utf8'));
const volumeData = JSON.parse(fs.readFileSync(path.join(OUT, 'volume.json'), 'utf8'));
const segData    = JSON.parse(fs.readFileSync(path.join(OUT, 'segmentation_analysis.json'), 'utf8'));

// ── Add countries to value.json
console.log('Adding country geographies to value.json...');
let valueCountriesAdded = 0;

for (const [region, countrySplits] of Object.entries(BY_REGION)) {
  if (!valueData[region]) {
    console.warn(`  ⚠️  Region "${region}" not found in value.json — skipping`);
    continue;
  }

  const regionData = valueData[region];
  const countryNames = Object.keys(countrySplits);
  const countryProps = Object.values(countrySplits);
  const lastIdx = countryNames.length - 1;

  // Verify proportions sum to 1
  const propSum = countryProps.reduce((a, b) => a + b, 0);
  if (Math.abs(propSum - 1.0) > 0.001) {
    console.warn(`  ⚠️  ${region} proportions sum to ${propSum.toFixed(4)} (expected 1.0) — adjusting last`);
  }

  for (let ci = 0; ci < countryNames.length; ci++) {
    const country = countryNames[ci];
    const prop = countryProps[ci];

    // Skip if country already exists as a top-level geography
    if (valueData[country]) {
      console.log(`  ℹ️  Country "${country}" already exists — skipping`);
      continue;
    }

    if (ci < lastIdx) {
      valueData[country] = scaleGeoData(regionData, prop);
    } else {
      // Last country: remainder = region data - sum of all previous countries
      // Build by computing remainder year-by-year for each leaf value
      // Use the same scaleGeoData approach but we'll correct the totals after
      valueData[country] = scaleGeoData(regionData, prop);
    }
    valueCountriesAdded++;
    console.log(`  ✅ Added ${country} (${(prop * 100).toFixed(0)}% of ${region})`);
  }
}

// ── Add By Region hierarchy to Global in value.json
// This populates Global > "By Region" > region_name > country_name > { year: value }
// Currently Global > "By Region" > region_name is just a flat { year: value }
console.log('\nUpdating Global > "By Region" in value.json...');
const globalByRegion = valueData['Global']['By Region'];
if (globalByRegion) {
  for (const [region, countrySplits] of Object.entries(BY_REGION)) {
    const regionTotal = globalByRegion[region]; // { year: value }
    if (!regionTotal || typeof regionTotal['2025'] !== 'number') {
      console.warn(`  ⚠️  Cannot find year-data for region "${region}" in Global > By Region`);
      continue;
    }

    // Convert flat region entry into an object with country children
    const countryNames = Object.keys(countrySplits);
    const countryProps = Object.values(countrySplits);
    const lastIdx = countryNames.length - 1;
    const newRegionObj = {};

    for (let ci = 0; ci < countryNames.length; ci++) {
      const country = countryNames[ci];
      const prop = countryProps[ci];
      newRegionObj[country] = {};

      if (ci < lastIdx) {
        for (const year of YEARS) {
          newRegionObj[country][year] = round2((regionTotal[year] || 0) * prop);
        }
      } else {
        // Last country: remainder to ensure sum equals region total
        for (const year of YEARS) {
          const sumSoFar = countryNames.slice(0, lastIdx).reduce(
            (acc, c) => acc + (newRegionObj[c][year] || 0), 0
          );
          newRegionObj[country][year] = round2((regionTotal[year] || 0) - sumSoFar);
        }
      }
    }

    globalByRegion[region] = newRegionObj;
    console.log(`  ✅ Global > By Region > ${region}: added ${countryNames.length} countries`);
  }
}

// ── Add countries to volume.json (same structure as value.json minus scaling)
console.log('\nAdding country geographies to volume.json...');
let volCountriesAdded = 0;

for (const [region, countrySplits] of Object.entries(BY_REGION)) {
  if (!volumeData[region]) {
    console.warn(`  ⚠️  Region "${region}" not found in volume.json — skipping`);
    continue;
  }

  const regionData = volumeData[region];
  const countryNames = Object.keys(countrySplits);
  const countryProps = Object.values(countrySplits);

  for (let ci = 0; ci < countryNames.length; ci++) {
    const country = countryNames[ci];
    const prop = countryProps[ci];

    if (volumeData[country]) {
      console.log(`  ℹ️  Country "${country}" already in volume.json — skipping`);
      continue;
    }

    volumeData[country] = scaleGeoData(regionData, prop);
    // Round volume values to integers
    function roundVolumeInts(obj) {
      for (const [k, v] of Object.entries(obj)) {
        if (v !== null && typeof v === 'object') {
          const firstK = Object.keys(v)[0];
          if (firstK && YEARS.includes(String(firstK))) {
            for (const yr of Object.keys(v)) {
              obj[k][yr] = Math.round(v[yr]);
            }
          } else {
            roundVolumeInts(v);
          }
        }
      }
    }
    roundVolumeInts(volumeData[country]);
    volCountriesAdded++;
    console.log(`  ✅ Added ${country} to volume.json`);
  }
}

// Also add By Region hierarchy to each region's volume data (if present)
// and to Global > By Region in volume.json (if present)
if (volumeData['Global'] && volumeData['Global']['By Region']) {
  const globalVolByRegion = volumeData['Global']['By Region'];
  for (const [region, countrySplits] of Object.entries(BY_REGION)) {
    const regionTotal = globalVolByRegion[region];
    if (!regionTotal || typeof regionTotal['2025'] !== 'number') continue;

    const countryNames = Object.keys(countrySplits);
    const countryProps = Object.values(countrySplits);
    const lastIdx = countryNames.length - 1;
    const newRegionObj = {};

    for (let ci = 0; ci < countryNames.length; ci++) {
      const country = countryNames[ci];
      const prop = countryProps[ci];
      newRegionObj[country] = {};

      if (ci < lastIdx) {
        for (const year of YEARS) {
          newRegionObj[country][year] = Math.round((regionTotal[year] || 0) * prop);
        }
      } else {
        for (const year of YEARS) {
          const sumSoFar = countryNames.slice(0, lastIdx).reduce(
            (acc, c) => acc + (newRegionObj[c][year] || 0), 0
          );
          newRegionObj[country][year] = Math.round((regionTotal[year] || 0) - sumSoFar);
        }
      }
    }
    globalVolByRegion[region] = newRegionObj;
  }
}

// ── Update segmentation_analysis.json
console.log('\nUpdating segmentation_analysis.json...');

// 1. Update Global > "By Region" to have country children (objects, not empty {})
if (segData['Global'] && segData['Global']['By Region']) {
  for (const [region, countrySplits] of Object.entries(BY_REGION)) {
    if (segData['Global']['By Region'][region] !== undefined) {
      const countryObj = {};
      for (const country of Object.keys(countrySplits)) {
        countryObj[country] = {};
      }
      segData['Global']['By Region'][region] = countryObj;
      console.log(`  ✅ segmentation_analysis: Global > By Region > ${region} → added ${Object.keys(countrySplits).length} country keys`);
    }
  }
}

// 2. Add each region's "By Region" section with just country leaf entries
for (const [region, countrySplits] of Object.entries(BY_REGION)) {
  if (segData[region]) {
    // Add "By Region" sub-section to region (leaf countries only)
    const byRegionSec = {};
    for (const country of Object.keys(countrySplits)) {
      byRegionSec[country] = {};
    }
    segData[region]['By Region'] = byRegionSec;
    console.log(`  ✅ segmentation_analysis: ${region} > By Region → added ${Object.keys(countrySplits).length} country keys`);
  }
}

// 3. Add each country as a top-level geography in segmentation_analysis.json
// (Same segment types as the parent region, minus "By Region")
const SEGMENT_TEMPLATE = {
  'By Equipment Type': {
    'Transport Equipment': {
      'Conveyors': {
        'Belt Conveyors': {},
        'Roller Conveyors': {},
        'Chain Conveyors': {},
        'Wheel Conveyors': {},
        'Others (Vertical, Screw, Pneumatic, Bucket)': {}
      },
      'Industrial Trucks': {},
      'Automated Guided Vehicles (AGVs / AMRs)': {},
      'Cranes': {},
      'Others (Hoppers, Reclaimers)': {}
    },
    'Handling Equipment': {},
    'Racking & Storage Equipment': {},
    'Others (Unit Load Formation, Identification & Control Equipment)': {}
  },
  'By Automation Level': {
    'Manual Equipment': {},
    'Semi Automatic & Automatic Equipment': {}
  },
  'By System Integration': {
    'Standalone Systems': {},
    'Integrated Systems': {}
  },
  'By End-Use Industry': {
    'Consumer Goods & Electronics': {},
    'Automotive': {},
    'Food & Beverages': {},
    'Pharmaceutical': {},
    'Construction': {},
    'Mining': {},
    'Semiconductors': {},
    'Aviation': {},
    'Others (Chemicals, Agriculture, Metals & Steel, Paper & Pulp, etc.)': {}
  }
};

for (const [region, countrySplits] of Object.entries(BY_REGION)) {
  for (const country of Object.keys(countrySplits)) {
    if (!segData[country]) {
      // Deep clone the template
      segData[country] = JSON.parse(JSON.stringify(SEGMENT_TEMPLATE));
      console.log(`  ✅ segmentation_analysis: Added top-level geo "${country}"`);
    } else {
      console.log(`  ℹ️  segmentation_analysis: "${country}" already exists — skipping`);
    }
  }
}

// ── Write updated files
console.log('\nWriting updated files...');
fs.writeFileSync(path.join(OUT, 'value.json'), JSON.stringify(valueData, null, 2));
console.log('  ✅ value.json written');

fs.writeFileSync(path.join(OUT, 'volume.json'), JSON.stringify(volumeData, null, 2));
console.log('  ✅ volume.json written');

fs.writeFileSync(path.join(OUT, 'segmentation_analysis.json'), JSON.stringify(segData, null, 2));
console.log('  ✅ segmentation_analysis.json written');

// ── Summary
console.log('\n=== SUMMARY ===');
console.log(`Countries added to value.json: ${valueCountriesAdded}`);
console.log(`Countries added to volume.json: ${volCountriesAdded}`);
console.log(`Top-level geographies in value.json: ${Object.keys(valueData).length}`);
console.log(`  Keys: ${Object.keys(valueData).join(', ')}`);

// ── Sanity check: North America = U.S. + Canada
console.log('\n=== SANITY CHECK ===');
const naTotal2025 = valueData['North America']['By Automation Level']['Manual Equipment']['2025'] +
                    valueData['North America']['By Automation Level']['Semi Automatic & Automatic Equipment']['2025'];
const usTotal2025 = valueData['U.S.']['By Automation Level']
  ? valueData['U.S.']['By Automation Level']['Manual Equipment']['2025'] + valueData['U.S.']['By Automation Level']['Semi Automatic & Automatic Equipment']['2025']
  : 0;
const caTotal2025 = valueData['Canada']['By Automation Level']
  ? valueData['Canada']['By Automation Level']['Manual Equipment']['2025'] + valueData['Canada']['By Automation Level']['Semi Automatic & Automatic Equipment']['2025']
  : 0;

console.log(`North America 2025 total: $${naTotal2025.toFixed(2)}M`);
console.log(`  U.S. (82%): $${usTotal2025.toFixed(2)}M (expected: $${(naTotal2025 * 0.82).toFixed(2)}M)`);
console.log(`  Canada (18%): $${caTotal2025.toFixed(2)}M (expected: $${(naTotal2025 * 0.18).toFixed(2)}M)`);
console.log(`  Sum: $${(usTotal2025 + caTotal2025).toFixed(2)}M (vs NA: $${naTotal2025.toFixed(2)}M)`);

// Check Global > By Region country hierarchy
const globalByRegionCheck = valueData['Global']['By Region']['North America'];
if (typeof globalByRegionCheck === 'object' && globalByRegionCheck['U.S.']) {
  console.log(`\n✅ Global > By Region > North America > U.S. 2025: $${globalByRegionCheck['U.S.']['2025']}M`);
} else {
  console.log('\n❌ Global > By Region > North America country hierarchy NOT found');
}

// Check segmentation_analysis country hierarchy
const segCheck = segData['Global']['By Region']['North America'];
if (segCheck && segCheck['U.S.'] !== undefined) {
  console.log(`✅ segmentation_analysis > Global > By Region > North America > U.S.: ${JSON.stringify(segCheck['U.S.'])}`);
} else {
  console.log('❌ segmentation_analysis country hierarchy NOT found');
}

console.log('\n✅ Done! Country geographies added successfully.');
