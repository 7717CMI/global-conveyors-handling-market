/**
 * CMI Dashboard Data Generator — Global Conveyors & Handling Market
 * Segment names sourced from: Data file-Input Sheet_Global Conveyors & Handling Market.xlsx
 */
const fs = require('fs'), path = require('path');
const YEARS = [2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033];
const GLOBAL_VALUE = {2021:7058.4,2022:7609,2023:8202.5,2024:8826.3,2025:9500,2026:10241,2027:11039.8,2028:11900.9,2029:12829,2030:13829.7,2031:14910.4,2032:16075.4,2033:17329.3};
const GLOBAL_VOLUME = {2021:156853,2022:169089,2023:182278,2024:196140,2025:211111,2026:227578,2027:245329,2028:264464,2029:285089,2030:307327,2031:331342,2032:357231,2033:385096};
const GEO_SHARES = {'Global':1,'North America':0.229,'Europe':0.212,'Asia Pacific':0.447,'Middle East & Africa':0.052,'Latin America':0.060};
const SEGMENTS = {
  'By Equipment Type': {
    'Transport Equipment': {'Conveyors':0.3008,'Industrial Trucks':0.2530,'Automated Guided Vehicles (AGVs / AMRs)':0.0479,'Cranes':0.0317,'Others (Hoppers, Reclaimers)':0.0136},
    'Handling Equipment':0.1020,'Racking & Storage Equipment':0.2010,
    'Others (Unit Load Formation, Identification & Control Equipment)':0.0500,
  },
  'By Automation Level':{'Manual Equipment':0.136,'Semi Automatic & Automatic Equipment':0.864},
  'By System Integration':{'Standalone Systems':0.613,'Integrated Systems':0.387},
  'By End-Use Industry':{'Consumer Goods & Electronics':0.246,'Automotive':0.178,'Food & Beverages':0.162,'Pharmaceutical':0.084,'Construction':0.073,'Mining':0.050,'Semiconductors':0.067,'Aviation':0.042,'Others (Chemicals, Agriculture, Metals & Steel, Paper & Pulp, etc.)':0.098},
  'By Region':{'North America':0.229,'Europe':0.212,'Asia Pacific':0.447,'Middle East & Africa':0.052,'Latin America':0.060},
};
const r2=n=>Math.round(n*100)/100, r0=n=>Math.round(n);
function yearVals(totals,g,s,rnd){const o={};YEARS.forEach(y=>o[String(y)]=rnd(totals[y]*g*s));return o;}
function buildData(totals,rnd){
  const data={};
  Object.entries(GEO_SHARES).forEach(([geo,gs])=>{
    data[geo]={};
    Object.entries(SEGMENTS).forEach(([st,segs])=>{
      data[geo][st]={};
      Object.entries(segs).forEach(([l1,v])=>{
        if(typeof v==='object'){data[geo][st][l1]={};Object.entries(v).forEach(([l2,s])=>data[geo][st][l1][l2]=yearVals(totals,gs,s,rnd));}
        else data[geo][st][l1]=yearVals(totals,gs,v,rnd);
      });
    });
  });
  return data;
}
function buildSeg(){
  const t={'By Equipment Type':{'Transport Equipment':{'Conveyors':{'Belt Conveyors':{},'Roller Conveyors':{},'Chain Conveyors':{},'Wheel Conveyors':{},'Others (Vertical, Screw, Pneumatic, Bucket)':{}},'Industrial Trucks':{},'Automated Guided Vehicles (AGVs / AMRs)':{},'Cranes':{},'Others (Hoppers, Reclaimers)':{}},'Handling Equipment':{},'Racking & Storage Equipment':{},'Others (Unit Load Formation, Identification & Control Equipment)':{}},'By Automation Level':{'Manual Equipment':{},'Semi Automatic & Automatic Equipment':{}},'By System Integration':{'Standalone Systems':{},'Integrated Systems':{}},'By End-Use Industry':{'Consumer Goods & Electronics':{},'Automotive':{},'Food & Beverages':{},'Pharmaceutical':{},'Construction':{},'Mining':{},'Semiconductors':{},'Aviation':{},'Others (Chemicals, Agriculture, Metals & Steel, Paper & Pulp, etc.)':{}},'By Region':{'North America':{},'Europe':{},'Asia Pacific':{},'Middle East & Africa':{},'Latin America':{}}};
  const r={};
  Object.keys(GEO_SHARES).forEach(geo=>{r[geo]=geo==='Global'?t:(({['By Region']:_,...rest})=>rest)(t);});
  return r;
}
const out=path.join(__dirname,'public','data');
fs.writeFileSync(path.join(out,'value.json'),JSON.stringify(buildData(GLOBAL_VALUE,r2),null,2));
fs.writeFileSync(path.join(out,'volume.json'),JSON.stringify(buildData(GLOBAL_VOLUME,r0),null,2));
fs.writeFileSync(path.join(out,'segmentation_analysis.json'),JSON.stringify(buildSeg(),null,2));
console.log('✅ value.json, volume.json, segmentation_analysis.json generated');
