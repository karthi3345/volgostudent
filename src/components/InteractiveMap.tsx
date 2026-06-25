'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mapData from '@svg-maps/france.regions'
import { 
  MapPin, 
  Sparkles
} from 'lucide-react'

// Define the region visual details and cities based on reference images
interface City {
  name: string
  x: number
  y: number
  isPrimary: boolean
  dx?: number
  dy?: number
}

interface RegionDetail {
  id: string
  name: string
  cities: City[]
  description: string
  capital: string
  keyFacts: string[]
}

const regionDetails: Record<string, RegionDetail> = {
  bre: {
    id: 'bre',
    name: 'Bretagne',
    cities: [
      { name: 'Brest', x: 35, y: 175, isPrimary: true },
      { name: 'Rennes', x: 105, y: 185, isPrimary: true },
      { name: 'Vannes', x: 75, y: 205, isPrimary: false },
      { name: 'Lorient', x: 60, y: 195, isPrimary: false },
      { name: 'Saint-Malo', x: 95, y: 165, isPrimary: false }
    ],
    capital: 'Rennes',
    description: 'Renowned for its wild coastlines, unique Celtic culture, and high quality of life. Bretagne is a top destination for students seeking a supportive academic community.',
    keyFacts: ['Strong research in telecommunications and marine sciences', 'Affordable cost of living', 'Over 75,000 students in Rennes and Brest']
  },
  ges: {
    id: 'ges',
    name: 'Grand Est',
    cities: [
      { name: 'Strasbourg', x: 520, y: 140, isPrimary: true },
      { name: 'Reims', x: 410, y: 100, isPrimary: false },
      { name: 'Metz', x: 465, y: 100, isPrimary: false },
      { name: 'Nancy', x: 468, y: 125, isPrimary: false },
      { name: 'Troyes', x: 415, y: 150, isPrimary: false },
      { name: 'Mulhouse', x: 505, y: 180, isPrimary: false }
    ],
    capital: 'Strasbourg',
    description: 'A European hub bordering Germany and Belgium. It offers dual-culture education programs and is home to the European Parliament.',
    keyFacts: ['Strasbourg is a world-class center for Chemistry and Biology', 'Strong cross-border job opportunities', 'Excellent transport links to Paris and Frankfurt']
  },
  pac: {
    id: 'pac',
    name: "Provence-Alpes-Côte d'Azur",
    cities: [
      { name: 'Marseille', x: 455, y: 485, isPrimary: true },
      { name: 'Avignon', x: 435, y: 445, isPrimary: false },
      { name: 'Aix-en-Provence', x: 465, y: 470, isPrimary: false },
      { name: 'Nice', x: 525, y: 455, isPrimary: false },
      { name: 'Toulon', x: 480, y: 495, isPrimary: false }
    ],
    capital: 'Marseille',
    description: 'The Mediterranean heart of France, offering vibrant student life, beautiful beaches, and prestigious institutions in science, business, and arts.',
    keyFacts: ['Major scientific hubs in Sophia Antipolis (Europe\'s leading science park)', 'Home to Aix-Marseille University, the largest in the French-speaking world', 'Vibrant Mediterranean culture and perfect sunny climate']
  },
  hdf: {
    id: 'hdf',
    name: 'Hauts-de-France',
    cities: [
      { name: 'Lille', x: 345, y: 35, isPrimary: true },
      { name: 'Amiens', x: 315, y: 75, isPrimary: false },
      { name: 'Calais', x: 300, y: 25, isPrimary: false },
      { name: 'Dunkerque', x: 325, y: 15, isPrimary: false },
      { name: 'Arras', x: 340, y: 60, isPrimary: false }
    ],
    capital: 'Lille',
    description: 'Positioned at the crossroads of Europe (London, Brussels, Paris). Highly dynamic and young student population with excellent universities and business schools.',
    keyFacts: ['Lille is known as one of the friendliest student cities in France', 'Strong focus on digital tech and retail logistics startups', 'Excellent international connections via Eurostar']
  },
  nor: {
    id: 'nor',
    name: 'Normandie',
    cities: [
      { name: 'Rouen', x: 235, y: 120, isPrimary: true },
      { name: 'Caen', x: 180, y: 130, isPrimary: false },
      { name: 'Le Havre', x: 195, y: 110, isPrimary: false },
      { name: 'Cherbourg', x: 130, y: 105, isPrimary: false }
    ],
    capital: 'Rouen',
    description: 'Rich in history and maritime culture. Home to beautiful landscapes, beaches, and historic cities with growing academic research centers.',
    keyFacts: ['Strong sectors in logistics, maritime energy, and biotechnology', 'Low student living costs compared to Paris', 'Direct train routes to the capital (just over 1 hour)']
  },
  idf: {
    id: 'idf',
    name: 'Île-de-France',
    cities: [
      { name: 'Paris', x: 320, y: 155, isPrimary: true, dx: -12, dy: -8 },
      { name: 'Versailles', x: 305, y: 158, isPrimary: false, dx: -68, dy: 10 },
      { name: 'Saint-Denis', x: 322, y: 144, isPrimary: false, dx: -20, dy: -10 },
      { name: 'Créteil', x: 332, y: 160, isPrimary: false, dx: 10, dy: 14 }
    ],
    capital: 'Paris',
    description: 'The world\'s leading center for culture, fashion, business, and higher education. It features an unparalleled concentration of globally top-ranked universities.',
    keyFacts: ['Home to Sorbonne University, PSL, and top-tier business/engineering schools', 'Unrivaled networking, internship, and career opportunities', 'Infinite cultural, artistic, and historical exploration']
  },
  pdl: {
    id: 'pdl',
    name: 'Pays de la Loire',
    cities: [
      { name: 'Nantes', x: 135, y: 240, isPrimary: true },
      { name: 'Angers', x: 175, y: 230, isPrimary: false },
      { name: 'Le Mans', x: 205, y: 205, isPrimary: false },
      { name: 'Saint-Nazaire', x: 105, y: 245, isPrimary: false }
    ],
    capital: 'Nantes',
    description: 'A highly innovative region consistently voted among the best places to live and study in France, combining economic dynamism with creative vibes.',
    keyFacts: ['Nantes is a major center for creative industries, robotics, and aeronautics', 'Angers has one of the highest ratios of students to residents', 'Beautiful Loire Valley castles and vineyards nearby']
  },
  cvl: {
    id: 'cvl',
    name: 'Centre-Val de Loire',
    cities: [
      { name: 'Orléans', x: 300, y: 200, isPrimary: true },
      { name: 'Tours', x: 255, y: 225, isPrimary: false },
      { name: 'Bourges', x: 305, y: 250, isPrimary: false }
    ],
    capital: 'Orléans',
    description: 'The historic heart of France, famous for its magnificent castles, natural beauty, and highly regarded centers for scientific research and language studies.',
    keyFacts: ['Strong research in cosmetics, energy, and environmental sciences', 'Stunning UNESCO World Heritage landscapes', 'Renowned for pure standard French pronunciation, ideal for language learners']
  },
  bfc: {
    id: 'bfc',
    name: 'Bourgogne-Franche-Comté',
    cities: [
      { name: 'Dijon', x: 415, y: 220, isPrimary: true },
      { name: 'Besançon', x: 465, y: 235, isPrimary: false },
      { name: 'Auxerre', x: 375, y: 205, isPrimary: false },
      { name: 'Belfort', x: 490, y: 215, isPrimary: false }
    ],
    capital: 'Dijon',
    description: 'A land of gastronomy, world-famous wines, and deep historical heritage combined with modern technological research in micro-technology and green energy.',
    keyFacts: ['Dijon is a UNESCO International Gastronomy City', 'Global leader in micro-technologies and precision engineering', 'Very friendly, compact, and affordable student cities']
  },
  naq: {
    id: 'naq',
    name: 'Nouvelle-Aquitaine',
    cities: [
      { name: 'Bordeaux', x: 165, y: 390, isPrimary: true },
      { name: 'Limoges', x: 235, y: 325, isPrimary: false },
      { name: 'Poitiers', x: 210, y: 285, isPrimary: false },
      { name: 'La Rochelle', x: 155, y: 300, isPrimary: false },
      { name: 'Pau', x: 160, y: 475, isPrimary: false }
    ],
    capital: 'Bordeaux',
    description: 'The largest region in France, stretching from sandy Atlantic beaches to rolling hills. Features world-famous wine cultures, aerospace tech, and lively cities.',
    keyFacts: ['Bordeaux is widely rated as a top student choice for lifestyle and culture', 'Major hub for aerospace, composite materials, and green chemistry', 'Home to over 100,000 university students']
  },
  ara: {
    id: 'ara',
    name: 'Auvergne-Rhône-Alpes',
    cities: [
      { name: 'Lyon', x: 425, y: 350, isPrimary: true },
      { name: 'Grenoble', x: 455, y: 385, isPrimary: false },
      { name: 'Saint-Étienne', x: 395, y: 368, isPrimary: false },
      { name: 'Clermont-Ferrand', x: 345, y: 345, isPrimary: false },
      { name: 'Annecy', x: 465, y: 340, isPrimary: false },
      { name: 'Chambéry', x: 458, y: 360, isPrimary: false }
    ],
    capital: 'Lyon',
    description: 'A economic powerhouse bordering Italy and Switzerland, famous for alpine mountains, world-class ski fields, and dominant tech, medical, and culinary centers.',
    keyFacts: ['Lyon is the second largest student city in France, with rich heritage', 'Grenoble is a global research hub (often called France\'s Silicon Valley)', 'Dominant in engineering, biotechnology, and nano-technologies']
  },
  occ: {
    id: 'occ',
    name: 'Occitanie',
    cities: [
      { name: 'Toulouse', x: 265, y: 480, isPrimary: true },
      { name: 'Montpellier', x: 345, y: 475, isPrimary: false },
      { name: 'Nîmes', x: 370, y: 455, isPrimary: false },
      { name: 'Perpignan', x: 285, y: 535, isPrimary: false }
    ],
    capital: 'Toulouse',
    description: 'Warm and sunny southern region. Toulouse is Europe\'s aerospace capital, and Montpellier features the oldest active medical school in the world.',
    keyFacts: ['Toulouse is regularly voted #1 Best Student City in France', 'Global headquarters of Airbus and aerospace innovation', 'Vibrant Spanish/Mediterranean-influenced food and festival culture']
  },
  cor: {
    id: 'cor',
    name: 'Corse',
    cities: [
      { name: 'Ajaccio', x: 550, y: 550, isPrimary: true },
      { name: 'Bastia', x: 570, y: 505, isPrimary: false }
    ],
    capital: 'Ajaccio',
    description: 'An island in the Mediterranean with breathtaking mountains and clear waters. Offers unique cultural research and marine study programs.',
    keyFacts: ['Specialized research in Mediterranean ecosystems and renewable energies', 'Beautiful, safe environment with close community feelings', 'Strong focus on ecological tourism development']
  }
}

// Custom Hook to manage dynamic mouse + scroll glow effect relative to section
function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const mouseScreenRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const updateGlow = () => {
      if (mouseScreenRef.current.x === -1000) return
      const rect = el.getBoundingClientRect()
      const x = mouseScreenRef.current.x - rect.left
      const y = mouseScreenRef.current.y - rect.top
      el.style.setProperty('--mouse-x', `${x}px`)
      el.style.setProperty('--mouse-y', `${y}px`)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseScreenRef.current = { x: e.clientX, y: e.clientY }
      updateGlow()
    }

    const handleScroll = () => {
      updateGlow()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return ref
}

export default function InteractiveMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('idf') // Default to Paris / Île-de-France
  const glowRef = useMouseGlow()

  const activeRegion = regionDetails[selectedRegion]

  return (
    <section id="students" ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Dynamic Glow Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-[#FFC800] font-semibold text-lg mb-4 block uppercase tracking-widest">Interactive Guide</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Explore <span className="text-[#FFC800]">France</span> by Region
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Hover over the map to discover key student cities and select any region to view detailed university insights, local capital details, and career opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Map Canvas Container */}
          <div className="lg:col-span-8 bg-[#000000] rounded-3xl p-2 border border-white/10 relative overflow-hidden flex items-center justify-center">
            
            <div className="relative w-full max-w-[760px] aspect-[630/610] overflow-hidden rounded-2xl bg-zinc-950/40 backdrop-blur-sm border border-white/5">
              
              {/* Interactive SVG Map (Native Coordinates with Padding: viewBox -20 -20 640 630) */}
              <svg 
                viewBox="-20 -20 640 630" 
                className="absolute inset-0 w-full h-full z-20 cursor-pointer"
              >
                <defs>
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodOpacity="0.8" floodColor="#FFC800" />
                  </filter>
                </defs>

                {/* Step 1: Render Region Interactive Paths */}
                {mapData.locations.map((loc) => {
                  const details = regionDetails[loc.id]
                  if (!details) return null

                  const isHovered = hoveredRegion === loc.id
                  const isSelected = selectedRegion === loc.id
                  const anyRegionHovered = hoveredRegion !== null

                  // Determine dynamic styling based on hover and selection states
                  let fill = 'rgba(255, 255, 255, 0.05)'
                  let stroke = 'rgba(255, 255, 255, 0.15)'
                  let strokeWidth = 1
                  let opacity = 1
                  let filter: string | undefined = undefined

                  if (isHovered) {
                    fill = 'rgba(255, 200, 0, 0.18)'
                    stroke = '#FFC800'
                    strokeWidth = 2.5
                    filter = 'url(#glow-gold)'
                  } else if (isSelected) {
                    fill = 'rgba(255, 200, 0, 0.06)'
                    stroke = 'rgba(255, 200, 0, 0.5)'
                    strokeWidth = 2
                  } else if (anyRegionHovered) {
                    // Dim non-hovered regions
                    fill = 'rgba(255, 255, 255, 0.02)'
                    stroke = 'rgba(255, 255, 255, 0.06)'
                    opacity = 0.6
                  }

                  return (
                    <path
                      key={loc.id}
                      d={loc.path}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      filter={filter}
                      className="transition-all duration-300 ease-out"
                      onMouseEnter={() => setHoveredRegion(loc.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(loc.id)}
                    />
                  )
                })}

                {/* Step 2: Render Cities (Revealed on Hover) */}
                <g className="pointer-events-none">
                  {mapData.locations.map((loc) => {
                    const details = regionDetails[loc.id]
                    if (!details) return null

                    const isHovered = hoveredRegion === loc.id

                    return (
                      <g key={`cities-${loc.id}`}>
                        {details.cities.map((city) => {
                          // Primary cities show by default, secondary cities show on hover
                          if (!city.isPrimary && !isHovered) return null

                          const labelDx = city.dx !== undefined ? city.dx : 8
                          const labelDy = city.dy !== undefined ? city.dy : 4

                          return (
                            <g 
                              key={`city-${city.name}`}
                              className="transition-opacity duration-300"
                            >
                              {/* Gold marker dot */}
                              <circle 
                                cx={city.x} 
                                cy={city.y} 
                                r={city.isPrimary ? 4 : 3} 
                                fill="#FFC800" 
                                stroke="#000000"
                                strokeWidth={city.isPrimary ? 1.5 : 1}
                              />
                              {/* City Label text */}
                              <text 
                                x={city.x + labelDx} 
                                y={city.y + labelDy} 
                                className={`fill-white font-extrabold select-none ${city.isPrimary ? 'text-[11px]' : 'text-[9.5px]'}`}
                                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9)' }}
                              >
                                {city.name}
                              </text>
                            </g>
                          )
                        })}
                      </g>
                    )
                  })}
                </g>
              </svg>

            </div>

          </div>

          {/* Right Side: Info Details Card */}
          <div className="lg:col-span-4 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRegion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
              >
                {/* Golden ambient glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC800]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FFC800]/15 transition-all duration-500" />
                
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                  <div>
                    <span className="text-[#FFC800] text-xs font-black uppercase tracking-widest block mb-2">Region Details</span>
                    <h3 className="text-3xl font-extrabold text-white leading-tight">
                      {activeRegion.name}
                    </h3>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 bg-white/5 shadow-inner">
                    <MapPin className="h-6 w-6 text-[#FFC800]" />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Capital Info */}
                  <div className="grid grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="col-span-1">
                      <span className="text-gray-500 text-xs block uppercase font-bold mb-1">Capital</span>
                      <span className="text-white font-extrabold text-sm">{activeRegion.capital}</span>
                    </div>
                    <div className="col-span-2 border-l border-white/10 pl-4">
                      <span className="text-gray-500 text-xs block uppercase font-bold mb-1.5">Featured Cities</span>
                      <div className="flex flex-wrap gap-1">
                        {activeRegion.cities.map((city) => (
                          <span 
                            key={city.name} 
                            className="text-white/90 font-bold text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap"
                          >
                            {city.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-[#FFC800] text-xs font-black uppercase tracking-widest block mb-2">About the Region</span>
                    <p className="text-gray-300 leading-relaxed text-base">
                      {activeRegion.description}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <div>
                    <span className="text-[#FFC800] text-xs font-black uppercase tracking-widest block mb-3">Academic & Career Highlights</span>
                    <ul className="space-y-3">
                      {activeRegion.keyFacts.map((fact, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#FFC800]/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="h-3 w-3 text-[#FFC800]" />
                          </div>
                          <span className="text-gray-300 text-sm leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Action Button */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <a 
                      href="#contact"
                      className="w-full bg-[#FFC800] hover:bg-[#FFD700] text-black font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#FFC800]/10"
                    >
                      <span>Plan Study in {activeRegion.name}</span>
                      <Sparkles className="h-4 w-4" />
                    </a>
                  </motion.div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  )
}
