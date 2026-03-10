/**
 * Competitive Intelligence Data Generator
 * Generates data for competitive dashboard and market share analysis
 * Last updated: 2024
 */

import { CHART_COLORS } from '@/lib/chart-theme'

export interface Proposition {
  title: string
  description: string
  category: string
}

export interface CompanyData {
  id: string
  name: string
  headquarters: string
  ceo: string
  yearEstablished: number
  portfolio: string
  strategies: string[]
  regionalStrength: string
  overallRevenue: number // in USD Mn
  segmentalRevenue: number // in USD Mn for 2024
  marketShare: number // percentage
  propositions?: Proposition[] // Dynamic propositions array
}

export interface MarketShareData {
  company: string
  marketShare: number
  color: string
}

export interface CompetitiveIntelligenceData {
  metadata: {
    market: string
    year: number
    currency: string
    revenue_unit: string
    total_companies: number
  }
  companies: CompanyData[]
  market_share_data: MarketShareData[]
}

let cachedData: CompetitiveIntelligenceData | null = null

/**
 * Parse competitive intelligence CSV row and extract propositions
 */
function parsePropositionsFromRow(row: Record<string, any>): Proposition[] {
  const propositions: Proposition[] = []
  
  // Look for proposition fields (Proposition 1 Title, Proposition 1 Description, etc.)
  let propIndex = 1
  while (true) {
    const titleKey = `Proposition ${propIndex} Title`
    const descKey = `Proposition ${propIndex} Description`
    const catKey = `Proposition ${propIndex} Category`
    
    const title = row[titleKey]?.toString().trim()
    const description = row[descKey]?.toString().trim()
    const category = row[catKey]?.toString().trim()
    
    // If no title, stop looking for more propositions
    if (!title || title === 'N/A' || title === '') {
      break
    }
    
    propositions.push({
      title,
      description: description || '',
      category: category || 'General'
    })
    
    propIndex++
    
    // Safety limit - prevent infinite loops
    if (propIndex > 10) break
  }
  
  return propositions
}

/**
 * Parse competitive intelligence data from CSV/JSON format
 */
export function parseCompetitiveIntelligenceFromData(rows: Record<string, any>[]): CompanyData[] {
  return rows.map((row, index) => {
    const marketShare = parseFloat(row['Market Share (%)']?.toString().replace('%', '') || '0')
    const revenue = generateRevenue(marketShare)
    
    // Parse propositions from row
    const propositions = parsePropositionsFromRow(row)
    
    // Get company name for color lookup
    const companyName = row['Company Name']?.toString() || ''
    const color = companyColors[companyName] || companyColors['Others'] || '#94a3b8'
    
    return {
      id: (row['Company ID'] || companyName.toLowerCase().replace(/\s+/g, '-') || `company-${index}`).toString(),
      name: companyName,
      headquarters: row['Headquarters']?.toString() || '',
      ceo: row['CEO']?.toString() || '',
      yearEstablished: parseInt(row['Year Established']?.toString() || '0'),
      portfolio: row['Product/Service Portfolio']?.toString() || '',
      strategies: (row['Strategies (comma-separated)']?.toString() || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      regionalStrength: row['Regional Strength']?.toString() || '',
      overallRevenue: parseFloat(row['Overall Revenue (USD Mn)']?.toString() || revenue.overall.toString()),
      segmentalRevenue: parseFloat(row['Segmental Revenue (USD Mn)']?.toString() || revenue.segmental.toString()),
      marketShare: marketShare,
      propositions: propositions.length > 0 ? propositions : undefined,
      color: color
    }
  })
}

/**
 * Load competitive intelligence data from store or API
 */
export async function loadCompetitiveIntelligenceData(): Promise<CompetitiveIntelligenceData | null> {
  if (cachedData) {
    return cachedData
  }

  // Try to get data from store first (if uploaded via dashboard builder)
  // Only try this in browser environment (client-side)
  if (typeof window !== 'undefined') {
    try {
      const { useDashboardStore } = require('./store')
      const store = useDashboardStore.getState()
      
      if (store.competitiveIntelligenceData && store.competitiveIntelligenceData.rows && store.competitiveIntelligenceData.rows.length > 0) {
        console.log('Using competitive intelligence data from store')
        // Parse the store data
        const companies = parseCompetitiveIntelligenceFromData(store.competitiveIntelligenceData.rows)
        
        // Calculate market share data
        const marketShareData = companies.map((company, index) => ({
          company: company.name,
          marketShare: company.marketShare,
          color: CHART_COLORS.primary[index % CHART_COLORS.primary.length]
        }))
        
        const data: CompetitiveIntelligenceData = {
          metadata: {
            market: 'Competitive Intelligence Market',
            year: 2024,
            currency: 'USD',
            revenue_unit: 'Mn',
            total_companies: companies.length
          },
          companies,
          market_share_data: marketShareData
        }
        
        // Cache the data
        cachedData = data
        return cachedData
      }
    } catch (error) {
      console.warn('Could not access store for competitive intelligence data:', error)
    }
  }

  try {
    // Try to load from API endpoint
    const response = await fetch('/api/load-competitive-intelligence', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      // If file not found, return null to use fallback data
      if (response.status === 404) {
        console.log('Competitive intelligence CSV not found, using fallback data')
        return null
      }
      throw new Error(`Failed to load competitive intelligence: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Cache the data
    cachedData = data as CompetitiveIntelligenceData
    
    return cachedData
  } catch (error) {
    console.error('Error loading competitive intelligence data:', error)
    // Return null to use fallback data
    return null
  }
}

// Top companies in Global Conveyors & Handling Market
const companies = [
  'KION Group AG',
  'Daifuku Co., Ltd.',
  'Toyota Industries Corporation',
  'SSI Schaefer',
  'Jungheinrich AG',
  'Honeywell Intelligrated',
  'Interroll Group',
  'Hytrol Conveyor Company',
  'Murata Machinery (Muratec)',
  'Others'
]

// Company colors using the enterprise palette
const companyColors: Record<string, string> = {
  'KION Group AG': '#52B69A',                // Teal
  'Daifuku Co., Ltd.': '#34A0A4',            // Medium Teal
  'Toyota Industries Corporation': '#D9ED92', // Yellow Green
  'SSI Schaefer': '#184E77',                  // Navy Blue
  'Jungheinrich AG': '#B5E48C',              // Light Lime
  'Honeywell Intelligrated': '#1E6091',      // Deep Blue
  'Interroll Group': '#168AAD',              // Deep Teal
  'Hytrol Conveyor Company': '#1A759F',      // Blue Teal
  'Murata Machinery (Muratec)': '#76C893',   // Fresh Green
  'Others': '#99D98C'                        // Medium Green
}

// Headquarters locations
const headquarters: Record<string, string> = {
  'KION Group AG': 'Frankfurt, Germany',
  'Daifuku Co., Ltd.': 'Osaka, Japan',
  'Toyota Industries Corporation': 'Kariya, Japan',
  'SSI Schaefer': 'Neunkirchen, Germany',
  'Jungheinrich AG': 'Hamburg, Germany',
  'Honeywell Intelligrated': 'Mason, Ohio, USA',
  'Interroll Group': 'Sant\'Antonino, Switzerland',
  'Hytrol Conveyor Company': 'Jonesboro, Arkansas, USA',
  'Murata Machinery (Muratec)': 'Kyoto, Japan',
  'Others': 'Various'
}

// CEOs
const ceos: Record<string, string> = {
  'KION Group AG': 'Rob Smith',
  'Daifuku Co., Ltd.': 'Hiroshi Geshiro',
  'Toyota Industries Corporation': 'Toshifumi Onishi',
  'SSI Schaefer': 'Steffen Bersch',
  'Jungheinrich AG': 'Lars Brzoska',
  'Honeywell Intelligrated': 'Ben Cardwell',
  'Interroll Group': 'Ingo Steinkrüger',
  'Hytrol Conveyor Company': 'David Peacock',
  'Murata Machinery (Muratec)': 'Bunji Murata',
  'Others': 'Multiple'
}

// Year established
const yearEstablished: Record<string, number> = {
  'KION Group AG': 2006,
  'Daifuku Co., Ltd.': 1937,
  'Toyota Industries Corporation': 1926,
  'SSI Schaefer': 1937,
  'Jungheinrich AG': 1953,
  'Honeywell Intelligrated': 2001,
  'Interroll Group': 1959,
  'Hytrol Conveyor Company': 1947,
  'Murata Machinery (Muratec)': 1935,
  'Others': 0
}

// Product portfolios
const portfolios: Record<string, string> = {
  'KION Group AG': 'Warehouse automation, AGVs/AMRs, Conveyors (Dematic brand)',
  'Daifuku Co., Ltd.': 'Conveyor systems, AS/RS, Airport baggage handling',
  'Toyota Industries Corporation': 'Forklifts, AGVs, Warehouse logistics (Toyota Material Handling)',
  'SSI Schaefer': 'Racking & storage, Conveyor systems, Shuttle systems',
  'Jungheinrich AG': 'Forklifts, AGVs, Warehouse management systems',
  'Honeywell Intelligrated': 'Sortation systems, Conveyors, Palletizers',
  'Interroll Group': 'Rollers, Conveyors, Sorters, Drum motors',
  'Hytrol Conveyor Company': 'Belt conveyors, Roller conveyors, Gravity conveyors',
  'Murata Machinery (Muratec)': 'AS/RS, Cleanroom handling, Shuttle systems',
  'Others': 'Various conveyor & material handling equipment'
}

// Regional strengths
const regionalStrengths: Record<string, string> = {
  'KION Group AG': 'Europe, North America',
  'Daifuku Co., Ltd.': 'Asia Pacific, North America',
  'Toyota Industries Corporation': 'Asia Pacific, Global',
  'SSI Schaefer': 'Europe, Asia Pacific',
  'Jungheinrich AG': 'Europe, Latin America',
  'Honeywell Intelligrated': 'North America, Europe',
  'Interroll Group': 'Europe, Asia Pacific',
  'Hytrol Conveyor Company': 'North America',
  'Murata Machinery (Muratec)': 'Japan, Asia Pacific',
  'Others': 'Global'
}

// Market share percentages (must sum to 100)
const marketShares: Record<string, number> = {
  'KION Group AG': 18.0,
  'Daifuku Co., Ltd.': 15.0,
  'Toyota Industries Corporation': 12.0,
  'SSI Schaefer': 10.0,
  'Jungheinrich AG': 8.0,
  'Honeywell Intelligrated': 7.0,
  'Interroll Group': 6.0,
  'Hytrol Conveyor Company': 5.0,
  'Murata Machinery (Muratec)': 4.0,
  'Others': 15.0
}

// Generate strategies based on company type
function generateStrategies(company: string): string[] {
  const strategyMap: Record<string, string[]> = {
    'KION Group AG': ['Warehouse Automation Leadership', 'Dematic Integration', 'Industry 4.0 Solutions'],
    'Daifuku Co., Ltd.': ['Airport Logistics Expansion', 'AS/RS Innovation', 'Smart Factory Solutions'],
    'Toyota Industries Corporation': ['Forklift Market Dominance', 'AGV Fleet Expansion', 'Lean Logistics'],
    'SSI Schaefer': ['Modular Storage Systems', 'Shuttle Technology', 'E-Commerce Fulfillment'],
    'Jungheinrich AG': ['Electric Fleet Transition', 'WMS Integration', 'European Expansion'],
    'Honeywell Intelligrated': ['Sortation Technology', 'AI-Driven Optimization', 'Robotics Integration'],
    'Interroll Group': ['Platform Strategy', 'Energy-Efficient Rollers', 'Modular Conveyor Design'],
    'Hytrol Conveyor Company': ['Integration Partner Network', 'Custom Belt Solutions', 'Quick-Ship Programs'],
    'Murata Machinery (Muratec)': ['Cleanroom Automation', 'Semiconductor Handling', 'Compact AS/RS'],
    'Others': ['Regional Specialization', 'Niche Applications', 'Cost-Competitive Solutions']
  }

  return strategyMap[company] || ['Market Development', 'Product Innovation', 'Strategic Partnerships']
}

// Generate propositions based on company type
function generatePropositions(company: string): Proposition[] {
  const propositionMap: Record<string, Proposition[]> = {
    'KION Group AG': [
      { title: 'Smart Warehouse Automation', description: 'End-to-end automated warehouse solutions powered by Dematic technology with AI-driven orchestration', category: 'Product Innovation' },
      { title: 'AGV/AMR Fleet Management', description: 'Scalable autonomous mobile robot fleets with centralized fleet management software', category: 'Automation' },
      { title: 'Global Service Network', description: '24/7 service and support across 100+ countries with predictive maintenance capabilities', category: 'Service Excellence' }
    ],
    'Daifuku Co., Ltd.': [
      { title: 'Airport Baggage Handling Excellence', description: 'Industry-leading baggage handling systems installed in 500+ airports worldwide', category: 'Market Leadership' },
      { title: 'AS/RS Systems', description: 'High-density automated storage and retrieval systems with throughput rates exceeding 1,000 pallets/hour', category: 'Product Innovation' },
      { title: 'Smart Factory Integration', description: 'Seamless conveyor integration with automotive and electronics manufacturing lines', category: 'Industry 4.0' }
    ],
    'Toyota Industries Corporation': [
      { title: 'Lean Material Handling', description: 'Toyota Production System principles applied to warehouse logistics and material flow optimization', category: 'Operational Excellence' },
      { title: 'Electric Forklift Leadership', description: 'World\'s largest forklift manufacturer with zero-emission electric fleet solutions', category: 'Sustainability' },
      { title: 'Integrated Logistics Solutions', description: 'Full-spectrum warehouse automation from forklifts to AGVs to conveyor systems', category: 'Comprehensive Solutions' }
    ],
    'SSI Schaefer': [
      { title: 'Modular Shuttle Systems', description: 'Highly scalable shuttle-based storage systems adaptable to any warehouse footprint', category: 'Product Innovation' },
      { title: 'E-Commerce Fulfillment', description: 'Purpose-built order fulfillment systems handling 100,000+ orders per day', category: 'Market Specialization' },
      { title: 'Racking & Storage Engineering', description: 'Custom-engineered racking solutions optimizing cubic storage utilization by up to 85%', category: 'Engineering Excellence' }
    ],
    'Jungheinrich AG': [
      { title: 'Energy-Efficient Fleet Solutions', description: 'Lithium-ion powered forklifts and AGVs reducing energy consumption by 30%', category: 'Sustainability' },
      { title: 'Warehouse Management Software', description: 'Proprietary WMS integrating all material handling equipment under unified control', category: 'Digital Solutions' },
      { title: 'Turnkey Warehouse Design', description: 'Complete warehouse planning, equipment, and software from a single source', category: 'Integrated Solutions' }
    ],
    'Honeywell Intelligrated': [
      { title: 'Advanced Sortation Systems', description: 'High-speed sortation systems processing 20,000+ items per hour with 99.9% accuracy', category: 'Product Innovation' },
      { title: 'AI-Powered Optimization', description: 'Machine learning algorithms optimizing conveyor throughput and reducing downtime by 40%', category: 'Technology' },
      { title: 'Lifecycle Management', description: 'Comprehensive lifecycle support from design through operation with IoT-enabled monitoring', category: 'Service Excellence' }
    ],
    'Interroll Group': [
      { title: 'Energy-Efficient Belt Systems', description: 'EC motor-driven roller conveyors reducing energy use by 50% vs. conventional systems', category: 'Sustainability' },
      { title: 'Modular Platform Approach', description: 'Standardized modular conveyor platforms enabling rapid deployment and reconfiguration', category: 'Product Design' },
      { title: 'Drum Motor Technology', description: 'Patented drum motor solutions providing compact, hygienic drive for food and pharma conveyors', category: 'Technology Leadership' }
    ],
    'Hytrol Conveyor Company': [
      { title: 'Integration Partner Network', description: 'Largest North American integration partner network with 100+ certified system integrators', category: 'Channel Strategy' },
      { title: 'Quick-Ship Conveyor Programs', description: 'Industry-leading 2-week delivery on standard belt and roller conveyor configurations', category: 'Speed to Market' },
      { title: 'E24 Conveyor Innovation', description: 'Next-generation 24V motorized driven roller conveyors for flexible, zone-controlled material flow', category: 'Product Innovation' }
    ],
    'Murata Machinery (Muratec)': [
      { title: 'Cleanroom Material Handling', description: 'Ultra-clean automated transport systems for semiconductor fabs with ISO Class 1 compatibility', category: 'Niche Specialization' },
      { title: 'Compact AS/RS Solutions', description: 'Space-saving automated storage systems designed for high-density environments', category: 'Product Innovation' },
      { title: 'Industry 4.0 Integration', description: 'IoT-connected handling systems with real-time monitoring and predictive analytics', category: 'Digital Transformation' }
    ],
    'Others': [
      { title: 'Regional Market Solutions', description: 'Tailored conveyor and handling systems for local industry requirements and regulations', category: 'Market Adaptation' },
      { title: 'Specialized Applications', description: 'Niche conveyor solutions for mining, food processing, and heavy industrial applications', category: 'Specialization' },
      { title: 'Cost-Competitive Systems', description: 'Value-engineered material handling equipment for budget-conscious operations', category: 'Value Proposition' }
    ]
  }

  return propositionMap[company] || [
    { title: 'Market Development', description: 'Expanding into new markets and segments', category: 'Market Strategy' },
    { title: 'Product Innovation', description: 'Continuous R&D and product development', category: 'Innovation' },
    { title: 'Strategic Partnerships', description: 'Building alliances for market expansion', category: 'Partnerships' }
  ]
}

// Generate revenue based on market share
function generateRevenue(marketShare: number): { overall: number, segmental: number } {
  // Total market size approximately $270,295 USD Mn (Global Conveyors & Handling Market, 2025)
  const totalMarketSize = 270295
  const segmentalRevenue = (marketShare / 100) * totalMarketSize
  
  // Overall revenue is typically 3-5x the segmental revenue (company has other products)
  const multiplier = 3 + Math.random() * 2
  const overallRevenue = segmentalRevenue * multiplier
  
  return {
    overall: Math.round(overallRevenue),
    segmental: Math.round(segmentalRevenue)
  }
}

/**
 * Generate competitive intelligence data for all companies
 * Now loads from store, JSON file, or fallback to hardcoded data
 * Can also accept parsed CSV data
 */
export async function generateCompetitiveData(csvData?: Record<string, any>[]): Promise<CompanyData[]> {
  // If CSV data is provided, parse it
  if (csvData && csvData.length > 0) {
    return parseCompetitiveIntelligenceFromData(csvData)
  }
  
  // Try to get data from store first (only in browser environment)
  if (typeof window !== 'undefined') {
    try {
      const { useDashboardStore } = require('./store')
      const store = useDashboardStore.getState()
      
      if (store.competitiveIntelligenceData && store.competitiveIntelligenceData.rows && store.competitiveIntelligenceData.rows.length > 0) {
        console.log('Using competitive intelligence data from store for generateCompetitiveData')
        return parseCompetitiveIntelligenceFromData(store.competitiveIntelligenceData.rows)
      }
    } catch (error) {
      console.warn('Could not access store for competitive intelligence data:', error)
    }
  }
  
  const jsonData = await loadCompetitiveIntelligenceData()
  
  if (jsonData && jsonData.companies) {
    return jsonData.companies
  }
  
  // Fallback to hardcoded data
  return companies.map(company => {
    const revenue = generateRevenue(marketShares[company])
    
    // Generate sample propositions based on company
    const propositions: Proposition[] = generatePropositions(company)
    
    return {
      id: company.toLowerCase().replace(/\s+/g, '-'),
      name: company,
      headquarters: headquarters[company],
      ceo: ceos[company],
      yearEstablished: yearEstablished[company],
      portfolio: portfolios[company],
      strategies: generateStrategies(company),
      regionalStrength: regionalStrengths[company],
      overallRevenue: revenue.overall,
      segmentalRevenue: revenue.segmental,
      marketShare: marketShares[company],
      propositions,
      color: companyColors[company]
    }
  })
}

/**
 * Generate market share data for pie chart
 * Now loads from JSON file, with fallback to hardcoded data
 * Groups smaller companies into "Others" to reduce clutter
 */
export async function generateMarketShareData(showTopN: number = 10): Promise<MarketShareData[]> {
  const jsonData = await loadCompetitiveIntelligenceData()
  
  let allData: MarketShareData[]
  
  if (jsonData && jsonData.market_share_data) {
    allData = jsonData.market_share_data
  } else {
    // Fallback to hardcoded data
    allData = companies.map(company => ({
      company,
      marketShare: marketShares[company],
      color: companyColors[company]
    }))
  }
  
  // Sort by market share (descending)
  const sorted = [...allData].sort((a, b) => b.marketShare - a.marketShare)
  
  // Take top N companies
  const topCompanies = sorted.slice(0, showTopN)
  
  // Group the rest into "Others"
  const othersShare = sorted.slice(showTopN).reduce((sum, c) => sum + c.marketShare, 0)
  
  if (othersShare > 0) {
    topCompanies.push({
      company: 'Others',
      marketShare: othersShare,
      color: '#94a3b8' // Gray color for Others
    })
  }
  
  return topCompanies
}

/**
 * Get top companies by market share
 */
export async function getTopCompanies(limit: number = 5): Promise<CompanyData[]> {
  const allCompanies = await generateCompetitiveData()
  return allCompanies
    .filter(c => c.name !== 'Others')
    .sort((a, b) => b.marketShare - a.marketShare)
    .slice(0, limit)
}

/**
 * Calculate market concentration (HHI - Herfindahl-Hirschman Index)
 */
export function calculateMarketConcentration(): { hhi: number; concentration: string } {
  const shares = Object.values(marketShares)
  const hhi = shares.reduce((sum, share) => sum + Math.pow(share, 2), 0)
  
  let concentration = 'Competitive'
  if (hhi < 1500) {
    concentration = 'Competitive'
  } else if (hhi < 2500) {
    concentration = 'Moderately Concentrated'
  } else {
    concentration = 'Highly Concentrated'
  }
  
  return { hhi: Math.round(hhi), concentration }
}

/**
 * Get company comparison data for competitive dashboard
 * Now includes propositions with parent/child header structure
 */
export async function getCompanyComparison(): Promise<{
  headers: string[];
  rows: { 
    label: string; 
    values: (string | number)[]; 
    section?: string; // Parent section header
    isProposition?: boolean; // Flag for proposition rows
  }[];
  sections?: string[]; // List of section headers
}> {
  const companies = (await generateCompetitiveData()).slice(0, 10) // Top 10 companies
  
  const headers = companies.map(c => c.name)
  
  // Find maximum number of propositions across all companies
  const maxPropositions = Math.max(
    ...companies.map(c => c.propositions?.length || 0),
    3 // Default to 3 if no propositions
  )
  
  const rows: { 
    label: string; 
    values: (string | number)[]; 
    section?: string;
    isProposition?: boolean;
  }[] = [
    {
      label: "Headquarters",
      values: companies.map(c => c.headquarters),
      section: "COMPANY INFORMATION"
    },
    {
      label: "Key Management (CEO)",
      values: companies.map(c => c.ceo),
      section: "COMPANY INFORMATION"
    },
    {
      label: "Year of Establishment",
      values: companies.map(c => c.yearEstablished || 'N/A'),
      section: "COMPANY INFORMATION"
    },
    {
      label: "Product/Service Portfolio",
      values: companies.map(c => c.portfolio),
      section: "PRODUCT & SERVICES"
    },
    {
      label: "Strategies/Recent Developments",
      values: companies.map(c => c.strategies.join(', ')),
      section: "STRATEGY & DEVELOPMENT"
    },
    {
      label: "Regional Strength",
      values: companies.map(c => c.regionalStrength),
      section: "MARKET PRESENCE"
    },
    {
      label: "Overall Revenue (USD Mn)",
      values: companies.map(c => c.overallRevenue.toLocaleString()),
      section: "FINANCIAL METRICS"
    },
    {
      label: "Segmental Revenue (USD Mn), 2024",
      values: companies.map(c => c.segmentalRevenue.toLocaleString()),
      section: "FINANCIAL METRICS"
    },
    {
      label: "Market Share (%)",
      values: companies.map(c => c.marketShare.toFixed(1) + '%'),
      section: "FINANCIAL METRICS"
    }
  ]
  
  // Add proposition rows dynamically
  if (maxPropositions > 0) {
    for (let i = 0; i < maxPropositions; i++) {
      const propIndex = i + 1
      
      // Proposition Title row
      rows.push({
        label: `Proposition ${propIndex} - Title`,
        values: companies.map(c => {
          const prop = c.propositions?.[i]
          return prop?.title || 'N/A'
        }),
        section: "VALUE PROPOSITIONS",
        isProposition: true
      })
      
      // Proposition Description row
      rows.push({
        label: `Proposition ${propIndex} - Description`,
        values: companies.map(c => {
          const prop = c.propositions?.[i]
          return prop?.description || 'N/A'
        }),
        section: "VALUE PROPOSITIONS",
        isProposition: true
      })
      
      // Proposition Category row
      rows.push({
        label: `Proposition ${propIndex} - Category`,
        values: companies.map(c => {
          const prop = c.propositions?.[i]
          return prop?.category || 'N/A'
        }),
        section: "VALUE PROPOSITIONS",
        isProposition: true
      })
    }
  }
  
  // Extract unique sections
  const sections = Array.from(new Set(rows.map(r => r.section).filter(Boolean))) as string[]
  
  return { headers, rows, sections }
}
