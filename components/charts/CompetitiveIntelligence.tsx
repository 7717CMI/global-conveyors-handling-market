'use client'

import { useState } from 'react'

interface OEMData {
  // OEM Information
  oemManufacturerName: string
  hqCountry: string
  primaryDoorTypeFocus: string // reused as primaryProductFocus
  automationFocus: string
  materialFocus: string
  keyEndUseFocus: string
  // Channel & Support
  goToMarketChannels: string
  serviceAftermarketStrength: string
  typicalPositioning: string
  keyDistributorIntegratorApproach: string
  // CMI Insights
  keyInsights: string
}

interface DistributorData {
  // Partner Profile
  distributorName: string
  parentGroupHoldingCompany: string
  hqCountry: string
  countriesCovered: string
  keyOEMBrandsCarried: string
  channelType: string
  keyDoorTypesCovered: string
  automationCapability: string
  endUseFocus: string
  // Contact Details
  keyContactPerson: string
  designation: string
  email: string
  phoneWhatsApp: string
  linkedIn: string
  website: string
  // Fit & Opportunity
  competitiveStrengths: string
  gapsWeaknesses: string
}

// Sample data for Industrial Door OEMs
const oemData: OEMData[] = [
  {
    oemManufacturerName: 'Daifuku Co., Ltd.',
    hqCountry: 'Japan',
    primaryDoorTypeFocus: 'Belt Conveyors, Overhead Conveyors, AGVs',
    automationFocus: 'Full Automation, AI-driven Sorting',
    materialFocus: 'Steel, Aluminum, Modular Plastics',
    keyEndUseFocus: 'E-commerce, Automotive, Airports',
    goToMarketChannels: 'Direct Sales, System Integrators',
    serviceAftermarketStrength: 'Strong - Global Service Network',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Strategic SI Partners, Direct Key Accounts',
    keyInsights: 'Global market leader (14% share), dominant in airport baggage & automotive paint lines'
  },
  {
    oemManufacturerName: 'BEUMER Group',
    hqCountry: 'Germany',
    primaryDoorTypeFocus: 'Belt Conveyors, Bucket Elevators, Overland Systems',
    automationFocus: 'Advanced Automation, IoT Monitoring',
    materialFocus: 'Steel, Heavy-duty Rubber, Composites',
    keyEndUseFocus: 'Mining, Cement, Bulk Materials',
    goToMarketChannels: 'Direct Sales, Regional Partners',
    serviceAftermarketStrength: 'Strong - Lifecycle Services',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'EPC Partners, Direct Project Sales',
    keyInsights: '10% market share, leader in overland conveying and high-capacity bulk handling'
  },
  {
    oemManufacturerName: 'Interroll Group',
    hqCountry: 'Switzerland',
    primaryDoorTypeFocus: 'Roller Conveyors, Belt Curves, Sorters',
    automationFocus: 'Modular Automation, Plug-and-Play',
    materialFocus: 'Steel, Aluminum, Engineered Plastics',
    keyEndUseFocus: 'Logistics, E-commerce, Food & Beverage',
    goToMarketChannels: 'OEM Partners, System Integrators',
    serviceAftermarketStrength: 'Strong - Platform-based Support',
    typicalPositioning: 'Mid to Premium',
    keyDistributorIntegratorApproach: 'OEM/SI Ecosystem, Certified Partners',
    keyInsights: '8% share, modular conveyor platform approach enables rapid deployment'
  },
  {
    oemManufacturerName: 'Hytrol Conveyor Company',
    hqCountry: 'USA',
    primaryDoorTypeFocus: 'Belt Conveyors, Roller Conveyors, Gravity Systems',
    automationFocus: 'Semi to Full Automation',
    materialFocus: 'Steel, Galvanized, Stainless Steel',
    keyEndUseFocus: 'Distribution, Manufacturing, Parcel Handling',
    goToMarketChannels: 'Integration Partner Network (100+)',
    serviceAftermarketStrength: 'Strong - Extensive US Network',
    typicalPositioning: 'Mid',
    keyDistributorIntegratorApproach: 'Exclusive Integration Partner Network',
    keyInsights: '7% share, largest US conveyor manufacturer with 100+ integration partners'
  },
  {
    oemManufacturerName: 'Coperion GmbH',
    hqCountry: 'Germany',
    primaryDoorTypeFocus: 'Pneumatic Conveying, Screw Conveyors, Feeders',
    automationFocus: 'Full Automation, Process Integration',
    materialFocus: 'Stainless Steel, Special Alloys',
    keyEndUseFocus: 'Chemicals, Plastics, Food, Pharma',
    goToMarketChannels: 'Direct Sales, Technical Partners',
    serviceAftermarketStrength: 'Strong - Global Service Centers',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Direct Sales, Specialized SI Partners',
    keyInsights: '6% share, leader in pneumatic conveying for process industries'
  },
  {
    oemManufacturerName: 'Dorner Mfg. Corp.',
    hqCountry: 'USA',
    primaryDoorTypeFocus: 'Belt Conveyors, Modular Conveyors, Sanitary Systems',
    automationFocus: 'Semi Automation, Clean-in-Place',
    materialFocus: 'Stainless Steel, Engineered Plastics',
    keyEndUseFocus: 'Food Processing, Pharma, Packaging',
    goToMarketChannels: 'Distributor Network, Direct Sales',
    serviceAftermarketStrength: 'Moderate - Partner Dependent',
    typicalPositioning: 'Mid to Premium',
    keyDistributorIntegratorApproach: 'Authorized Distributors, Direct OEM Sales',
    keyInsights: '5% share, strong in sanitary/washdown conveyor applications'
  },
  {
    oemManufacturerName: 'FlexLink AB',
    hqCountry: 'Sweden',
    primaryDoorTypeFocus: 'Chain Conveyors, Pallet Systems, Overhead Conveyors',
    automationFocus: 'Full Automation, Line Integration',
    materialFocus: 'Aluminum, Stainless Steel, Plastics',
    keyEndUseFocus: 'Automotive, Electronics, Healthcare',
    goToMarketChannels: 'Direct Sales, Authorized Partners',
    serviceAftermarketStrength: 'Moderate - Regional Focus',
    typicalPositioning: 'Mid to Premium',
    keyDistributorIntegratorApproach: 'Regional Partners, Direct Key Accounts',
    keyInsights: '5% share, known for flexible chain conveyor solutions in assembly lines'
  },
  {
    oemManufacturerName: 'WAMGROUP S.p.A.',
    hqCountry: 'Italy',
    primaryDoorTypeFocus: 'Screw Conveyors, Vibrating Screens, Dust Filters',
    automationFocus: 'Semi to Full Automation',
    materialFocus: 'Carbon Steel, Stainless Steel',
    keyEndUseFocus: 'Concrete, Mining, Waste Water, Chemicals',
    goToMarketChannels: 'Direct Sales, Subsidiaries Worldwide',
    serviceAftermarketStrength: 'Strong - 60+ Subsidiaries',
    typicalPositioning: 'Value to Mid',
    keyDistributorIntegratorApproach: 'Own Subsidiary Network, Local Dealers',
    keyInsights: '4% share, world leader in screw conveyors for bulk solids handling'
  },
  {
    oemManufacturerName: 'Key Technology (Duravant)',
    hqCountry: 'USA',
    primaryDoorTypeFocus: 'Vibratory Conveyors, Belt Conveyors, Sorters',
    automationFocus: 'Full Automation, Vision-based Sorting',
    materialFocus: 'Stainless Steel, Food-grade Materials',
    keyEndUseFocus: 'Food Processing, Agriculture, Tobacco',
    goToMarketChannels: 'Direct Sales, Food Industry SIs',
    serviceAftermarketStrength: 'Moderate - Specialized Service',
    typicalPositioning: 'Premium',
    keyDistributorIntegratorApproach: 'Direct Sales, Industry-specific Partners',
    keyInsights: '3% share, specialist in vibratory conveying with integrated digital sorting'
  },
]

const distributorData = [
  { distributorName: 'Handling Systems International', parentGroupHoldingCompany: 'Independent', hqCountry: 'USA', countriesCovered: 'USA, Canada, Mexico', keyOEMBrandsCarried: 'Hytrol, Dorner, Interroll', channelType: 'Value-Added Reseller', keyDoorTypesCovered: 'Belt, Roller, Chain Conveyors', automationCapability: 'Semi to Full Automation', endUseFocus: 'Distribution Centers, E-commerce', keyContactPerson: 'John Mitchell', designation: 'VP Sales', email: 'jmitchell@hsi.com', phoneWhatsApp: '+1-555-0101', linkedIn: 'linkedin.com/in/jmitchell', website: 'www.hsi.com', competitiveStrengths: 'Strong US network, multi-brand expertise', gapsWeaknesses: 'Limited MEA presence' },
  { distributorName: 'Conveyor & Automation GmbH', parentGroupHoldingCompany: 'Independent', hqCountry: 'Germany', countriesCovered: 'Germany, Austria, Switzerland, BeNeLux', keyOEMBrandsCarried: 'BEUMER, Coperion, FlexLink', channelType: 'System Integrator', keyDoorTypesCovered: 'Bulk Handling, Screw, Pneumatic', automationCapability: 'Full Automation', endUseFocus: 'Industrial, Chemical, Mining', keyContactPerson: 'Klaus Werner', designation: 'Director', email: 'kwerner@ca-gmbh.de', phoneWhatsApp: '+49-555-0202', linkedIn: 'linkedin.com/in/kwerner', website: 'www.ca-gmbh.de', competitiveStrengths: 'Deep DACH expertise, engineering services', gapsWeaknesses: 'Limited Asia coverage' },
  { distributorName: 'Asia Conveyor Solutions', parentGroupHoldingCompany: 'ACS Holdings', hqCountry: 'Singapore', countriesCovered: 'Singapore, Malaysia, Thailand, Indonesia, Vietnam', keyOEMBrandsCarried: 'Daifuku, Interroll, BEUMER', channelType: 'Regional Distributor', keyDoorTypesCovered: 'Overhead, Belt, AGVs', automationCapability: 'Full Automation, AI Sorting', endUseFocus: 'E-commerce, Automotive, Pharma', keyContactPerson: 'Mei Lin Tan', designation: 'CEO', email: 'mltan@acs.com.sg', phoneWhatsApp: '+65-555-0303', linkedIn: 'linkedin.com/in/mltan', website: 'www.acs.com.sg', competitiveStrengths: 'ASEAN coverage, multilingual support', gapsWeaknesses: 'Limited bulk handling expertise' },
]


interface CompetitiveIntelligenceProps {
  height?: number
}

export function CompetitiveIntelligence({ height }: CompetitiveIntelligenceProps) {
  const [activeTable, setActiveTable] = useState<'oem' | 'distributor'>('oem')

  const renderOEMTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={6} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              OEM Information
            </th>
            <th colSpan={4} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Channel & Support
            </th>
            <th colSpan={1} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              CMI Insights
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* OEM Information */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              OEM / Manufacturer Name
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">
              HQ Country
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Primary Conveyor Type Focus
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Automation Focus
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Material Focus
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Key End-use Focus
            </th>
            {/* Channel & Support */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Go-to-Market Channels
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Service / Aftermarket Strength
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              <div>Typical Positioning</div>
              <div className="font-normal text-[10px] text-gray-600">(Value/Mid/Premium)</div>
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              Key Distributor/Integrator Approach
            </th>
            {/* CMI Insights */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[200px]">
              Key Insights
            </th>
          </tr>
        </thead>
        <tbody>
          {oemData.map((oem, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* OEM Information */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black font-medium">{oem.oemManufacturerName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.hqCountry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.primaryDoorTypeFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.automationFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.materialFocus}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.keyEndUseFocus}</td>
              {/* Channel & Support */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.goToMarketChannels}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.serviceAftermarketStrength}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.typicalPositioning}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.keyDistributorIntegratorApproach}</td>
              {/* CMI Insights */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{oem.keyInsights}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderDistributorTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th colSpan={9} className="bg-[#E8C4A0] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Partner Profile
            </th>
            <th colSpan={6} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Contact Details
            </th>
            <th colSpan={2} className="bg-[#87CEEB] border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-black">
              Fit & Opportunity
            </th>
          </tr>
          <tr className="bg-gray-100">
            {/* Partner Profile */}
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Distributor / Channel Partner Name
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Parent Group / Holding Company
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[100px]">
              HQ Country
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Countries Covered
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Key OEM Brands Carried
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              <div>Channel Type</div>
              <div className="font-normal text-[10px] text-gray-600">(Retailers/EPC Contractor/Others)</div>
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Key Door Types Covered
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Automation Capability
            </th>
            <th className="bg-[#FFF8DC] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              End-use Focus
            </th>
            {/* Contact Details */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Key Contact Person
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Designation / Department
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              Email
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Phone / WhatsApp
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[150px]">
              LinkedIn
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[130px]">
              Website
            </th>
            {/* Fit & Opportunity */}
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Competitive Strengths
            </th>
            <th className="bg-[#B0E0E6] border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-black min-w-[180px]">
              Gaps / Weaknesses
            </th>
          </tr>
        </thead>
        <tbody>
          {distributorData.map((distributor, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Partner Profile */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black font-medium">{distributor.distributorName}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.parentGroupHoldingCompany}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.hqCountry}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.countriesCovered}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.keyOEMBrandsCarried}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.channelType}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.keyDoorTypesCovered}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.automationCapability}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.endUseFocus}</td>
              {/* Contact Details */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.keyContactPerson}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.designation}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`mailto:${distributor.email}`}>{distributor.email}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.phoneWhatsApp}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${distributor.linkedIn}`} target="_blank" rel="noopener noreferrer">{distributor.linkedIn}</a>
              </td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-blue-600 hover:underline">
                <a href={`https://${distributor.website}`} target="_blank" rel="noopener noreferrer">{distributor.website}</a>
              </td>
              {/* Fit & Opportunity */}
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.competitiveStrengths}</td>
              <td className="border border-gray-300 px-3 py-2 text-sm text-black">{distributor.gapsWeaknesses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-black mb-4">
        {activeTable === 'oem' ? 'OEM Intelligence' : 'Distributor Intelligence'}
      </h2>

      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTable('oem')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTable === 'oem'
              ? 'bg-[#4A90A4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          OEM Intelligence
        </button>
        <button
          onClick={() => setActiveTable('distributor')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTable === 'distributor'
              ? 'bg-[#4A90A4] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Distributor Intelligence
        </button>
      </div>

      {/* Render Active Table */}
      {activeTable === 'oem' ? renderOEMTable() : renderDistributorTable()}
    </div>
  )
}

export default CompetitiveIntelligence
