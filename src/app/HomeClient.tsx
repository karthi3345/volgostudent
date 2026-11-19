'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  GraduationCap,
  MapPin,
  BookOpen,
  Users,
  ChevronDown,
  Mail,
  Phone,
  Send,
  Star,
  Globe,
  Award,
  Target,
  Heart,
  CheckCircle,
  Menu,
  X,
  Calendar,
  Laptop,
  Palette,
  Languages,
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Loader2,
  Download,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

import Image from 'next/image'
import dynamic from 'next/dynamic'

const DynamicInteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center text-white/50">Loading Map...</div>
})


// Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [isVisible, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// Custom Hook to manage dynamic mouse + scroll glow effect relative to section
function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const mouseScreenRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    // Disable completely on mobile screens to prevent layout thrashing (getBoundingClientRect)
    if (typeof window !== 'undefined' && window.innerWidth < 768) return

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

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseScreenRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        updateGlow()
      }
    }

    const handleScroll = () => {
      updateGlow()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return ref
}

// Single Plane Component managing its own direction, height variations, and return loops
function SinglePlane({ planeData }: { planeData: any }) {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(planeData.initialDirection)
  const [y, setY] = useState(planeData.y)
  const [duration, setDuration] = useState(planeData.duration)
  const [isFirstRun, setIsFirstRun] = useState(true)

  const startX = direction === 'ltr' ? '-20vw' : '120vw'
  const endX = direction === 'ltr' ? '120vw' : '-20vw'
  const rotation = direction === 'ltr' ? 90 : 270

  // On first load, start mid-flight at a pre-calculated initial X position
  const initialX = isFirstRun ? planeData.initialX : startX

  const handleAnimationComplete = () => {
    setIsFirstRun(false)
    setDirection((prev) => (prev === 'ltr' ? 'rtl' : 'ltr'))

    // Randomize Y slightly around its base lane height (+/- 2.5% offset)
    const baseVal = parseFloat(planeData.y)
    const offset = (Math.random() - 0.5) * 5
    const newY = Math.max(2, Math.min(98, baseVal + offset))
    setY(`${newY}%`)

    // Randomize duration slightly (+/- 4 seconds)
    const newDuration = planeData.duration + (Math.random() - 0.5) * 8
    setDuration(newDuration)
  }

  // Calculate remaining path fraction for the first run so speed remains constant
  const remainingFraction = () => {
    if (!isFirstRun) return 1
    const current = parseFloat(initialX)
    const total = 140 // total viewport span from -20vw to 120vw is 140
    const end = direction === 'ltr' ? 120 : -20
    return Math.abs(end - current) / total
  }

  const runDuration = duration * remainingFraction()

  return (
    <motion.img
      src="/images/topview.webp"
      alt="Floating Plane"
      className="absolute anti-alias-plane"
      style={{
        width: planeData.width,
        height: 'auto',
        top: y,
        transformOrigin: 'center',
        opacity: planeData.opacity
      }}
      initial={{ x: initialX }}
      animate={{
        x: endX,
        rotate: [rotation, rotation]
      }}
      transition={{
        duration: runDuration,
        ease: "linear"
      }}
      onAnimationComplete={handleAnimationComplete}
    />
  )
}

// Background planes moving randomly across the page
function BackgroundPlanes() {
  const basePlanes = [
    // Hero & Upper sections (widths ranging from 80px to 260px)
    { id: 1, y: '4%', duration: 35, width: '260px', opacity: 0.85, initialDirection: 'ltr', initialX: '35vw' },
    { id: 2, y: '18%', duration: 42, width: '100px', opacity: 0.75, initialDirection: 'rtl', initialX: '75vw' },
    { id: 3, y: '10%', duration: 40, width: '180px', opacity: 0.85, initialDirection: 'ltr', initialX: '15vw' },
    { id: 4, y: '28%', duration: 37, width: '80px', opacity: 0.7, initialDirection: 'rtl', initialX: '60vw' },

    // Middle sections (Timeline & Students)
    { id: 5, y: '36%', duration: 38, width: '210px', opacity: 0.85, initialDirection: 'ltr', initialX: '50vw' },
    { id: 6, y: '52%', duration: 45, width: '110px', opacity: 0.75, initialDirection: 'rtl', initialX: '85vw' },
    { id: 7, y: '44%', duration: 44, width: '240px', opacity: 0.85, initialDirection: 'ltr', initialX: '20vw' },
    { id: 8, y: '60%', duration: 41, width: '90px', opacity: 0.7, initialDirection: 'rtl', initialX: '45vw' },

    // Lower sections (Map, Reasons, Blogs, Contact)
    { id: 9, y: '68%', duration: 39, width: '170px', opacity: 0.85, initialDirection: 'ltr', initialX: '65vw' },
    { id: 10, y: '82%', duration: 43, width: '120px', opacity: 0.8, initialDirection: 'rtl', initialX: '10vw' },
    { id: 11, y: '75%', duration: 36, width: '85px', opacity: 0.7, initialDirection: 'ltr', initialX: '80vw' },
    { id: 12, y: '88%', duration: 46, width: '230px', opacity: 0.85, initialDirection: 'rtl', initialX: '30vw' },
    { id: 13, y: '94%', duration: 41, width: '250px', opacity: 0.9, initialDirection: 'ltr', initialX: '55vw' },
    { id: 14, y: '97%', duration: 43, width: '130px', opacity: 0.8, initialDirection: 'rtl', initialX: '90vw' }
  ]

  return (
    <div className="hidden md:block absolute inset-0 pointer-events-none z-[5] overflow-hidden">
      {basePlanes.map((plane) => (
        <SinglePlane key={plane.id} planeData={plane} />
      ))}
    </div>
  )
}

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
)

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.498 1.201-.82 1.233-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.415-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.867-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.432.898-.65a62.835 62.835 0 0 1 7.001-2.998c3.342-1.385 4.035-1.626 4.492-1.636z"/>
  </svg>
)

// Map Country Hotspot definition
interface CountryHotspot {
  id: string
  name: string
  leftPct: number
  topPct: number
  active: boolean
  badge: string
  desc: string
  programs: string
  visa: string
  targetSectionId?: string
  cx: number
  cy: number
  rx: number
  ry: number
}

const EUROPE_COUNTRIES: CountryHotspot[] = [
  {
    id: "france",
    name: "France",
    leftPct: 63.4,
    topPct: 55.83,
    active: true,
    badge: "Active Destination",
    desc: "Top destination for Indian students! Affordable tuition, 2-year post-study work visa, English-taught programs, and world-class Grandes Écoles.",
    programs: "1,600+ English Programs",
    visa: "2-Year Post-Study Visa",
    targetSectionId: "students", // scrolls directly to France Interactive Map & Universities guide!
    cx: 1060,
    cy: 460,
    rx: 110,
    ry: 100
  },
  {
    id: "germany",
    name: "Germany",
    leftPct: 72.37,
    topPct: 47.94,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Renowned for tuition-free public universities, world-class engineering, automotive excellence, and high post-study employment.",
    programs: "Engineering & Tech",
    visa: "18-Month Job Seeker Visa",
    targetSectionId: "country-modal",
    cx: 1210,
    cy: 375,
    rx: 75,
    ry: 90
  },
  {
    id: "spain",
    name: "Spain",
    leftPct: 56.22,
    topPct: 72.21,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Vibrant European culture, affordable living costs, and top-tier triple-accredited business schools in Madrid and Barcelona.",
    programs: "Business & Management",
    visa: "1-Year Job Search Visa",
    targetSectionId: "country-modal",
    cx: 920,
    cy: 600,
    rx: 105,
    ry: 85
  },
  {
    id: "italy",
    name: "Italy",
    leftPct: 74.16,
    topPct: 64.93,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Centuries of academic heritage, global powerhouse in Fashion, Design, Architecture, and prestigious public universities with regional scholarships.",
    programs: "Design, Fashion & Arts",
    visa: "Regional Scholarships",
    targetSectionId: "country-modal",
    cx: 1235,
    cy: 555,
    rx: 75,
    ry: 105
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    leftPct: 60.11,
    topPct: 37.01,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "World-famous Russell Group universities, intensive 1-year master courses, and vibrant multicultural campuses.",
    programs: "Russell Group Degrees",
    visa: "Graduate Route (2 Yrs)",
    targetSectionId: "country-modal",
    cx: 1005,
    cy: 285,
    rx: 60,
    ry: 85
  },
  {
    id: "ireland",
    name: "Ireland",
    leftPct: 53.53,
    topPct: 35.19,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "The Silicon Valley of Europe! European HQ for Google, Apple, Meta with strong 2-year post-study work visa and English-speaking environment.",
    programs: "Tech, Data & Finance",
    visa: "2-Year Stamp 1G Visa",
    targetSectionId: "country-modal",
    cx: 895,
    cy: 270,
    rx: 48,
    ry: 58
  },
  {
    id: "poland",
    name: "Poland",
    leftPct: 80.14,
    topPct: 49.76,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Rapidly growing tech and medical education center in Central Europe with low living costs and recognized English-taught degrees.",
    programs: "Medicine & IT Programs",
    visa: "Schengen Work Access",
    targetSectionId: "country-modal",
    cx: 1335,
    cy: 355,
    rx: 75,
    ry: 70
  },
  {
    id: "finland",
    name: "Finland",
    leftPct: 82.54,
    topPct: 23.67,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Happiest country with world-leading education system, top innovation scores, clean environment, and fast permanent residency pathway for graduates.",
    programs: "Innovation & AI",
    visa: "Post-Study Permanent Residency",
    targetSectionId: "country-modal",
    cx: 1380,
    cy: 160,
    rx: 65,
    ry: 95
  },
  {
    id: "sweden",
    name: "Sweden",
    leftPct: 75.36,
    topPct: 24.88,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Home of the Nobel Prize, sustainability leader, world-renowned technology hubs (Spotify, Klarna), and research excellence.",
    programs: "Sustainability & Tech",
    visa: "1-Year Job Seeking Visa",
    targetSectionId: "country-modal",
    cx: 1255,
    cy: 180,
    rx: 55,
    ry: 100
  },
  {
    id: "norway",
    name: "Norway",
    leftPct: 69.68,
    topPct: 24.27,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Stunning natural beauty, high standard of living, and cutting-edge programs in Renewable Energy, Marine Sciences, and Biotechnology.",
    programs: "Renewable Energy & Marine",
    visa: "Nordic Quality of Life",
    targetSectionId: "country-modal",
    cx: 1160,
    cy: 180,
    rx: 55,
    ry: 95
  },
  {
    id: "denmark",
    name: "Denmark",
    leftPct: 70.57,
    topPct: 31.55,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Progressive education focusing on critical thinking, collaborative learning, green transition, and thriving pharmaceutical & design sectors.",
    programs: "Pharma, Tech & Design",
    visa: "Establishment Card",
    targetSectionId: "country-modal",
    cx: 1180,
    cy: 240,
    rx: 42,
    ry: 42
  },
  {
    id: "portugal",
    name: "Portugal",
    leftPct: 46.05,
    topPct: 74.03,
    active: false,
    badge: "Consultancy Coming Soon",
    desc: "Sunny climate, safe welcoming society, vibrant tech startup ecosystem (Web Summit), and historic European universities.",
    programs: "Business & Tech Startups",
    visa: "EU Residence Pathway",
    targetSectionId: "country-modal",
    cx: 770,
    cy: 610,
    rx: 42,
    ry: 72
  }
]

// Sparkles Canvas Component matching reference script.js
function SparklesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars: Array<{ x: number; y: number; r: number; p: number; s: number }> = []
    let animationFrameId: number

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(15, Math.round(r.width / 28))
      stars = Array.from({ length: count }, () => ({
        x: r.width * (0.40 + Math.random() * 0.60),
        y: Math.random() * r.height * 0.88,
        r: Math.random() * 1.5 + 0.4,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.02 + 0.007
      }))
    }

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)

      for (const st of stars) {
        st.p += st.s
        const a = (Math.sin(st.p) + 1) / 2
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 205, 120, ${a * 0.85})`
        ctx.shadowColor = 'rgba(255, 190, 90, 0.9)'
        ctx.shadowBlur = 6
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      animationFrameId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  )
}

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleWindowClick = () => setOpenDropdown(null)
    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [])

  const handleCountryClick = (countryId: string) => {
    setOpenDropdown(null)
    setIsMobileMenuOpen(false)
    if (countryId === 'france') {
      const el = document.getElementById('about') || document.getElementById('contact')
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      const el = document.getElementById('europe-map-section')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[110] bg-white transition-all duration-300 font-lato ${
        isScrolled ? 'shadow-md h-[74px] md:h-[92px]' : 'h-[84px] md:h-[116px]'
      }`}
    >
      <div className="w-full h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex items-center cursor-pointer flex-shrink-0"
          aria-label="VolGO Home"
        >
          <img
            src="/images/logo.png"
            alt="VolGO – Your Global Education Partner"
            className={`w-auto object-contain transition-all duration-300 ${
              isScrolled ? 'h-[54px] md:h-[68px]' : 'h-[64px] md:h-[84px]'
            }`}
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center flex-1 px-4">
          <ul className="flex items-center gap-0">
            <li>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center px-4 py-2 text-[18px] font-semibold text-[#d6a548] relative transition-colors"
              >
                Home
                <span className="absolute bottom-[-18px] left-4 right-4 h-[2.5px] bg-[#d6a548] rounded-full" />
              </a>
            </li>

            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center px-4 py-2 text-[18px] font-normal text-[#1a1a1a] hover:text-[#d6a548] transition-colors"
              >
                About
              </a>
            </li>

            {/* Countries Dropdown */}
            <li
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setOpenDropdown('countries')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'countries' ? null : 'countries')}
                className="flex items-center gap-2 px-4 py-2 text-[18px] font-normal text-[#1a1a1a] hover:text-[#d6a548] transition-colors cursor-pointer"
              >
                Countries
                <ChevronDown
                  className={`w-4 h-4 text-[#d6a548] transition-transform duration-200 ${
                    openDropdown === 'countries' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute top-full left-2 min-w-[230px] bg-white rounded-xl shadow-2xl py-2 border-t-[3px] border-[#d6a548] transition-all duration-200 z-50 ${
                  openDropdown === 'countries'
                    ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                    : 'opacity-0 invisible translate-y-2 pointer-events-none'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCountryClick('france')}
                  className="w-full text-left px-5 py-2.5 text-[15px] font-semibold text-[#d6a548] bg-[#faf4e8] hover:bg-[#f5ebcf] transition-all flex items-center justify-between"
                >
                  <span>France</span>
                  <span className="text-[11px] bg-[#d6a548] text-black px-2 py-0.5 rounded-full font-bold">Active</span>
                </button>
                {['Germany', 'Italy', 'Spain', 'Ireland', 'Poland', 'Finland'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCountryClick(c.toLowerCase())}
                    className="w-full text-left px-5 py-2 text-[15px] text-[#1a1a1a] hover:bg-[#faf4e8] hover:text-[#d6a548] hover:pl-7 transition-all flex items-center justify-between"
                  >
                    <span>{c}</span>
                    <span className="text-[10px] text-stone-400">Soon</span>
                  </button>
                ))}
              </div>
            </li>

            {/* Services Dropdown */}
            <li
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setOpenDropdown('services')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                className="flex items-center gap-2 px-4 py-2 text-[18px] font-normal text-[#1a1a1a] hover:text-[#d6a548] transition-colors cursor-pointer"
              >
                Services
                <ChevronDown
                  className={`w-4 h-4 text-[#d6a548] transition-transform duration-200 ${
                    openDropdown === 'services' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute top-full left-2 min-w-[250px] bg-white rounded-xl shadow-2xl py-2 border-t-[3px] border-[#d6a548] transition-all duration-200 z-50 ${
                  openDropdown === 'services'
                    ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                    : 'opacity-0 invisible translate-y-2 pointer-events-none'
                }`}
              >
                {[
                  'University Selection',
                  'Application Support',
                  'Visa Assistance',
                  'Pre-Departure Guidance'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null)
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="w-full text-left px-5 py-2 text-[15px] text-[#1a1a1a] hover:bg-[#faf4e8] hover:text-[#d6a548] hover:pl-7 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>

            {/* Resources Dropdown */}
            <li
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setOpenDropdown('resources')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'resources' ? null : 'resources')}
                className="flex items-center gap-2 px-4 py-2 text-[18px] font-normal text-[#1a1a1a] hover:text-[#d6a548] transition-colors cursor-pointer"
              >
                Resources
                <ChevronDown
                  className={`w-4 h-4 text-[#d6a548] transition-transform duration-200 ${
                    openDropdown === 'resources' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute top-full left-2 min-w-[210px] bg-white rounded-xl shadow-2xl py-2 border-t-[3px] border-[#d6a548] transition-all duration-200 z-50 ${
                  openDropdown === 'resources'
                    ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                    : 'opacity-0 invisible translate-y-2 pointer-events-none'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null)
                    document.getElementById('blogs')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left px-5 py-2 text-[15px] text-[#1a1a1a] hover:bg-[#faf4e8] hover:text-[#d6a548] hover:pl-7 transition-all"
                >
                  Blog & Articles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null)
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left px-5 py-2 text-[15px] text-[#1a1a1a] hover:bg-[#faf4e8] hover:text-[#d6a548] hover:pl-7 transition-all"
                >
                  Scholarships
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null)
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full text-left px-5 py-2 text-[15px] text-[#1a1a1a] hover:bg-[#faf4e8] hover:text-[#d6a548] hover:pl-7 transition-all"
                >
                  FAQs
                </button>
              </div>
            </li>

            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center px-4 py-2 text-[18px] font-normal text-[#1a1a1a] hover:text-[#d6a548] transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Right CTA Button */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <a
            href="https://wa.me/918778108770"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
            className="text-[#25D366] hover:text-[#128C7E] transition-all hover:scale-110 p-2"
          >
            <WhatsappIcon className="h-6 w-6" />
          </a>
          <button
            type="button"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2.5 bg-[#d8a543] hover:bg-[#e0b153] text-[#1b1b1b] font-bold text-[16px] px-6 h-[46px] rounded-full whitespace-nowrap shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <span>Get Free Consultation</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href="https://wa.me/918778108770"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
            className="text-[#25D366] hover:text-[#128C7E] p-2"
          >
            <WhatsappIcon className="h-6 w-6" />
          </a>
          <button
            type="button"
            className="text-[#14213d] p-2 focus:outline-none cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-2xl px-6 py-6 overflow-y-auto max-h-[85vh]"
          >
            <div className="space-y-3 font-lato">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="block text-[18px] font-semibold text-[#d6a548] py-2 border-b border-gray-100"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="block text-[18px] font-normal text-[#1a1a1a] py-2 border-b border-gray-100"
              >
                About
              </a>

              {/* Mobile Countries */}
              <div className="py-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'm-countries' ? null : 'm-countries')}
                  className="w-full flex items-center justify-between text-[18px] text-[#1a1a1a] font-normal"
                >
                  <span>Countries</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#d6a548] transition-transform ${
                      openDropdown === 'm-countries' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openDropdown === 'm-countries' && (
                  <div className="mt-3 pl-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleCountryClick('france')}
                      className="w-full text-left text-[15px] font-semibold text-[#d6a548] py-1 flex items-center justify-between"
                    >
                      <span>France</span>
                      <span className="text-[10px] bg-[#d6a548] text-black px-2 py-0.5 rounded-full font-bold">Active</span>
                    </button>
                    {['Germany', 'Italy', 'Spain', 'Ireland', 'Poland', 'Finland'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCountryClick(c.toLowerCase())}
                        className="w-full text-left text-[15px] text-gray-700 py-1"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Services */}
              <div className="py-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'm-services' ? null : 'm-services')}
                  className="w-full flex items-center justify-between text-[18px] text-[#1a1a1a] font-normal"
                >
                  <span>Services</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#d6a548] transition-transform ${
                      openDropdown === 'm-services' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openDropdown === 'm-services' && (
                  <div className="mt-3 pl-4 space-y-2 text-[15px] text-gray-700">
                    {['University Selection', 'Application Support', 'Visa Assistance', 'Pre-Departure Guidance'].map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="py-1 cursor-pointer"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Resources */}
              <div className="py-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'm-resources' ? null : 'm-resources')}
                  className="w-full flex items-center justify-between text-[18px] text-[#1a1a1a] font-normal"
                >
                  <span>Resources</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#d6a548] transition-transform ${
                      openDropdown === 'm-resources' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openDropdown === 'm-resources' && (
                  <div className="mt-3 pl-4 space-y-2 text-[15px] text-gray-700">
                    <div
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        document.getElementById('blogs')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-1 cursor-pointer"
                    >
                      Blog
                    </div>
                    <div
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-1 cursor-pointer"
                    >
                      Scholarships
                    </div>
                    <div
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="py-1 cursor-pointer"
                    >
                      FAQs
                    </div>
                  </div>
                )}
              </div>

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="block text-[18px] font-normal text-[#1a1a1a] py-2"
              >
                Contact
              </a>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#d8a543] hover:bg-[#e0b153] text-[#1b1b1b] font-bold text-[16px] py-3.5 rounded-full shadow-md"
                >
                  <span>Get Free Consultation</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// Hero Section matching reference design with interactive Europe map
function HeroSection() {
  const [hoveredCountry, setHoveredCountry] = useState<CountryHotspot | null>(null)
  const [selectedCountryModal, setSelectedCountryModal] = useState<CountryHotspot | null>(null)

  const handleCountryActivate = (country: CountryHotspot) => {
    if (country.id === 'france') {
      // Scroll smoothly to the France Interactive Map section
      const target = document.getElementById('students') || document.getElementById('about')
      target?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Show country destination modal / consultation preview
      setSelectedCountryModal(country)
    }
  }

  return (
    <section
      id="home"
      className="relative w-full aspect-auto lg:aspect-[1672/824] min-h-[660px] lg:min-h-[740px] mt-[84px] md:mt-[116px] bg-[#0b0a09] overflow-hidden select-none"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Explore Europe - VolGO Education Partner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_bottom] md:object-[center_bottom]"
        />
        {/* Soft gradient overlay on mobile for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent lg:from-black/35 lg:via-transparent lg:to-transparent" />
      </div>

      {/* Sparkles Canvas Layer */}
      <SparklesCanvas />

      {/* SVG Illumination Layer: When hovering over any country, lights up with warm amber glow just like France */}
      <svg
        viewBox="0 0 1672 824"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300"
      >
        <defs>
          {EUROPE_COUNTRIES.map((c) => (
            <radialGradient
              key={`grad-${c.id}`}
              id={`amber-glow-${c.id}`}
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#d6a548" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#d6a548" stopOpacity="0.55" />
              <stop offset="75%" stopColor="#e6c27a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d6a548" stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="country-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Dynamic Country Glow on hover - ONLY lights up when that specific country is hovered */}
        {EUROPE_COUNTRIES.map((c) => {
          const isHovered = hoveredCountry?.id === c.id
          if (!isHovered) return null

          return (
            <g key={`glow-group-${c.id}`} className="transition-all duration-300">
              {/* Massive ambient golden glow */}
              <ellipse
                cx={c.cx}
                cy={c.cy}
                rx={Math.round(c.rx * 1.5)}
                ry={Math.round(c.ry * 1.5)}
                fill={`url(#amber-glow-${c.id})`}
                filter="url(#country-blur)"
                className="pointer-events-none opacity-90"
              />
              {/* Vivid warm amber fill directly on country area */}
              <ellipse
                cx={c.cx}
                cy={c.cy}
                rx={c.rx}
                ry={c.ry}
                fill="#d6a548"
                filter="url(#country-blur)"
                className="pointer-events-none opacity-40"
              />
              {/* Concentrated bright core highlight */}
              <ellipse
                cx={c.cx}
                cy={c.cy}
                rx={Math.round(c.rx * 0.75)}
                ry={Math.round(c.ry * 0.75)}
                fill="#ffd57a"
                filter="url(#country-blur)"
                className="pointer-events-none opacity-50"
              />
            </g>
          )
        })}
      </svg>

      {/* Interactive Map Hotspots Overlay (Desktop / Tablet) */}
      <div className="absolute inset-0 z-20">
        {EUROPE_COUNTRIES.map((country) => {
          const isHovered = hoveredCountry?.id === country.id

          return (
            <div
              key={country.id}
              style={{
                left: `${country.leftPct}%`,
                top: `${country.topPct}%`,
                width: `${Math.max(64, country.rx * 1.6)}px`,
                height: `${Math.max(64, country.ry * 1.6)}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute flex items-center justify-center cursor-pointer pointer-events-auto"
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => handleCountryActivate(country)}
            >
              {/* Interactive Target Circle / Pin */}
              <div className="relative group flex items-center justify-center">
                {/* Glow ring on hover */}
                <div
                  className={`absolute -inset-3 rounded-full transition-all duration-300 ${
                    isHovered
                      ? 'bg-[#d6a548]/50 scale-125 shadow-[0_0_25px_#d6a548] opacity-100'
                      : 'opacity-0 group-hover:opacity-100 group-hover:bg-[#d6a548]/30'
                  }`}
                />

                {/* Pin Core */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 border ${
                    isHovered
                      ? 'w-7 h-7 md:w-9 md:h-9 bg-[#d6a548] border-white scale-110 shadow-lg ring-4 ring-[#d6a548]/50 text-black font-extrabold'
                      : 'w-4 h-4 md:w-5 md:h-5 bg-black/60 border-[#d6a548]/80 group-hover:bg-[#d6a548] group-hover:border-white'
                  }`}
                >
                  {country.id === 'france' && isHovered ? (
                    <GraduationCap className="w-4 h-4 text-black" />
                  ) : (
                    <div className="w-2 h-2 bg-[#d6a548] group-hover:bg-black rounded-full" />
                  )}
                </div>

                {/* Country Label tag */}
                <div
                  className={`absolute left-1/2 -bottom-6 -translate-x-1/2 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide whitespace-nowrap transition-all duration-200 pointer-events-none ${
                    isHovered
                      ? 'bg-[#d6a548] text-black shadow-md opacity-100 translate-y-0.5'
                      : 'opacity-0 group-hover:opacity-100 bg-black/80 text-white'
                  }`}
                >
                  {country.name}
                </div>

                {/* Hover Tooltip / Detail Card */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-9 left-1/2 -translate-x-1/2 w-64 md:w-72 p-3.5 rounded-xl bg-stone-950/95 border border-[#d6a548]/60 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-md z-50 text-left pointer-events-none"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-lora text-[17px] font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#d6a548]" />
                        {country.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          country.active
                            ? 'bg-[#d6a548] text-black font-bold'
                            : 'bg-white/10 text-stone-300'
                        }`}
                      >
                        {country.badge}
                      </span>
                    </div>

                    <p className="text-[12px] text-stone-300 leading-relaxed mb-2 font-lato">
                      {country.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10 text-[11px] text-stone-400 font-lato">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#d6a548]">Focus</span>
                        <span className="text-white font-medium">{country.programs}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-[#d6a548]">Post-Study</span>
                        <span className="text-white font-medium">{country.visa}</span>
                      </div>
                    </div>

                    {country.active ? (
                      <div className="mt-2.5 pt-2 border-t border-[#d6a548]/30 flex items-center justify-between text-[11px] font-bold text-[#d6a548]">
                        <span>Click to view France map & cities</span>
                        <Send className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-[#e6c27a]">
                        <span>Click to view details</span>
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hero Content on the Left */}
      <div className="relative z-20 h-full flex items-center px-6 sm:px-12 lg:px-24 py-16 lg:py-24 max-w-7xl mx-auto">
        <div className="max-w-2xl text-left font-lato">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-lora font-medium text-white text-[42px] sm:text-[58px] lg:text-[76px] leading-[1.05] tracking-tight drop-shadow-md"
          >
            Explore Europe
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="font-lora italic font-semibold text-[#e6c27a] text-[26px] sm:text-[36px] lg:text-[46px] mt-2 lg:mt-3 leading-tight drop-shadow"
          >
            Your Dream. Our Guidance.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="text-stone-200 text-[16px] sm:text-[18px] lg:text-[22px] leading-relaxed mt-5 lg:mt-8 max-w-xl font-normal drop-shadow"
          >
            Discover top universities, exciting opportunities <br className="hidden sm:inline" />
            and a brighter future across Europe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-7 lg:mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => {
                const target = document.getElementById('students') || document.getElementById('about')
                target?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-3 px-8 h-[52px] lg:h-[58px] border-2 border-[#d6a548] rounded-full text-[#e6c27a] hover:bg-[#d6a548] hover:text-[#111] text-[16px] lg:text-[18px] font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(214,165,72,0.25)] hover:shadow-[0_0_30px_rgba(214,165,72,0.6)] cursor-pointer group"
            >
              <span>Start Your Journey</span>
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            {/* Quick France Pill Badge */}
            <button
              type="button"
              onClick={() => handleCountryActivate(EUROPE_COUNTRIES[0])}
              className="inline-flex items-center gap-2 px-5 h-[52px] lg:h-[58px] bg-black/50 hover:bg-black/75 border border-[#d6a548]/40 hover:border-[#d6a548] rounded-full text-white text-[14px] lg:text-[15px] font-medium backdrop-blur-sm transition-all cursor-pointer group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#d6a548] animate-pulse" />
              <span>Study in France Direct Pathway</span>
              <ChevronDown className="w-4 h-4 text-[#d6a548] -rotate-90 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Country Detail Modal for other countries */}
      <AnimatePresence>
        {selectedCountryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCountryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-stone-900 border border-[#d6a548]/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-left"
            >
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#d6a548]/20 border border-[#d6a548]/40 flex items-center justify-center text-[#d6a548]">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-lora text-2xl font-bold text-white">
                    {selectedCountryModal.name}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-[#e6c27a] inline-block mt-1">
                    {selectedCountryModal.badge}
                  </span>
                </div>
              </div>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6 font-lato">
                {selectedCountryModal.desc}
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-stone-950/60 rounded-xl border border-white/5 mb-6 text-sm font-lato">
                <div>
                  <span className="text-xs uppercase text-[#d6a548] font-bold block mb-1">Key Disciplines</span>
                  <span className="text-white font-medium">{selectedCountryModal.programs}</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-[#d6a548] font-bold block mb-1">Post-Study Visa</span>
                  <span className="text-white font-medium">{selectedCountryModal.visa}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountryModal(null)
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex-1 bg-[#d8a543] hover:bg-[#e0b153] text-black font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#d8a543]/20"
                >
                  <span>Pre-Register for {selectedCountryModal.name}</span>
                  <Send className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountryModal(null)
                    document.getElementById('students')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-5 py-3.5 rounded-xl border border-white/20 hover:border-[#d6a548] text-white hover:text-[#d6a548] text-sm font-semibold transition-all cursor-pointer text-center"
                >
                  Explore France Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function PathToSuccessSection() {
  const glowRef = useMouseGlow()
  return (
    <section ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/student-success-path-europe.webp"
          alt="Student Success Path - Study in Europe from India"
          fill
          className="object-cover object-[80%_bottom] md:object-center opacity-80 scale-80 md:scale-100"
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* Dynamic Glow Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 450px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
          }}
        />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-[#FFC800] mb-4 leading-tight">
            Your Path to Success
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-10">
            Empowering Indian Students
          </h3>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
            VolGO is your ultimate partner in navigating the journey of higher education in France.
            We specialize in providing tailored consultancy services to Indian students, helping you
            unlock opportunities in prestigious institutions. Our dedicated team offers expert guidance,
            comprehensive resources, and personalized support to ensure you achieve your academic dreams
            abroad. With VolGO, you're not just pursuing education; you're embarking on a transformative
            adventure that shapes your future.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Stats Section
function StatsSection() {
  const stats = [
    { icon: Users, value: 430000, suffix: '+', label: 'International students in France' },
    { icon: BookOpen, value: 1600, suffix: '+', label: 'HIGHER EDUCATION PROGRAMS TAUGHT in ENGLISH' },
    { icon: Award, value: 60, suffix: '+', label: 'NOBEL PRIZES FOR RESEARCH IN FRANCE' },
  ]

  return (
    <section className="relative py-16 bg-[#FFC800]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-black font-extrabold text-2xl md:text-3xl tracking-wider uppercase mb-12">
          KEY FIGURES FOR FRENCH EDUCATION
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center px-4"
            >
              <stat.icon className="h-10 w-10 mx-auto mb-3 text-black" />
              <div className="text-3xl md:text-4xl font-extrabold text-black mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-black/80 font-bold uppercase tracking-wide text-sm max-w-xs mx-auto leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// About Section
function AboutSection() {
  const glowRef = useMouseGlow()
  const features = [
    {
      icon: Target,
      title: 'Personalized Guidance',
      description: 'Tailored consultancy services that match your academic goals and career aspirations with the right French institutions.'
    },
    {
      icon: BookOpen,
      title: 'Expert Knowledge',
      description: 'Deep understanding of the French education system, admission processes, and scholarship opportunities.'
    },
    {
      icon: Heart,
      title: 'Dedicated Support',
      description: 'End-to-end assistance from application to arrival, ensuring a smooth transition to your new academic life.'
    },
    {
      icon: CheckCircle,
      title: 'Proven Results',
      description: 'Track record of successfully placing students in top French universities and grandes écoles.'
    }
  ]

  return (
    <section id="about" ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/overseas-education-consultant-welcome.webp"
          alt="Welcome to VolGo Student - Expert Overseas Education Consultant"
          fill
          className="object-cover object-[30%_80%] md:object-center opacity-80 scale-100 md:scale-100"
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* Dynamic Glow Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
          }}
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#FFC800] font-semibold text-lg mb-4 block">About Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Welcome to <span className="text-[#FFC800]">VolGO</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            At VolGO, we believe every student deserves the opportunity to achieve their global education dreams with confidence. Established with a vision to bridge aspiring students with world-class education in France, we are committed to providing trusted guidance, personalized support, and a seamless pathway to academic success. From choosing the right university to preparing for life in France, we're with you every step of the way.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl relative overflow-hidden group shadow-lg"
        >
          {/* Subtle gold glow behind card */}
          <div className="absolute inset-0 bg-[#FFC800]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
          <Sparkles className="h-6 w-6 text-[#FFC800] mx-auto mb-4 animate-pulse" />
          <p className="text-xl md:text-2xl font-extrabold text-white leading-relaxed tracking-wide italic">
            "We don’t just guide students; <br className="hidden md:block" />
            we <span className="text-[#FFC800] drop-shadow-[0_0_10px_rgba(255,200,0,0.3)]">build futures</span>."
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#FFC800]/50 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC800] to-[#FFA500] flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Transition Timeline Component for Student Safe Passage
function SafePassageTimeline() {
  const timelineSteps = [
    {
      phase: "Phase 1: Clear Pre-Departure Prep (In India)",
      title: "Academic Mapping & Financial Prep",
      description: "Personalized support matching your budget and academic profile with the right universities. Complete guidance on financial requirements, bank docs, and educational loans so you have absolute transparency.",
      icon: Target,
      color: "from-yellow-400 to-amber-500",
    },
    {
      phase: "Phase 2: Stress-Free Documentation",
      title: "Admissions & Visa Filings",
      description: "Step-by-step assistance in preparing application files and drafting SOPs. We manage mock visa interviews and double-check all documents to ensure a stellar approval rate.",
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
    },
    {
      phase: "Phase 3: Guaranteed Landing Support",
      title: "Safe Transition & Accommodation",
      description: "Never feel alone when arriving in a new country. We coordinate flight briefings, organize airport pick-ups, and secure certified student housing in France before you fly.",
      icon: MapPin,
      color: "from-orange-500 to-red-500",
    },
    {
      phase: "Phase 4: French Admin Integration (In France)",
      title: "Setting Up Your New Life",
      description: "Our local French team walks you through essential registrations: opening a French bank account, setting up transport passes, securing healthcare cards, and applying for CAF housing subsidies.",
      icon: GraduationCap,
      color: "from-red-500 to-purple-600",
    }
  ]

  const glowRef = useMouseGlow()
  return (
    <section ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/safe-passage-roadmap-french-universities.webp"
          alt="Safe Passage Roadmap to French Universities"
          fill
          className="object-cover object-[75%_center] md:object-center opacity-80 scale-15 md:scale-100"
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* Dynamic Glow Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
          }}
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-500 text-sm font-medium backdrop-blur-sm mb-4">
            Zero-Anxiety Move to Europe
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The VolGO <span className="text-[#FFC800]">Safe Passage</span> Roadmap
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Transitioning from India to France can feel overwhelming. We've built an end-to-end guidance network to keep you safe, secure, and fully set up.
          </p>
        </motion.div>

        <div className="relative border-l-2 border-dashed border-yellow-500/30 ml-4 md:ml-32 md:pl-8 space-y-12">
          {timelineSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 animate-pulse" />
              </div>

              {/* Number tag */}
              <span className="absolute left-[-90px] top-1.5 hidden md:block text-5xl font-black text-white/10 select-none">
                0{index + 1}
              </span>

              <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-yellow-500/50 transition-all duration-300">
                <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-start">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <step.icon className="h-7 w-7 text-black" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wider text-yellow-500 font-bold">
                      {step.phase}
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Students Section
function StudentsSection() {
  const glowRef = useMouseGlow()
  const glowRef2 = useMouseGlow()
  const benefits = [
    {
      icon: Star,
      title: 'High-Quality Education',
      description: 'France offers top-tier education with globally recognized degrees from world-renowned universities and institutions.',
      color: 'from-[#FFC800] to-[#FFA500]'
    },
    {
      icon: BookOpen,
      title: 'Flexible Courses',
      description: 'A wide variety of programs are available, taught in English and French, catering to diverse academic interests and career paths.',
      color: 'from-[#FFD700] to-[#FFC800]'
    },
    {
      icon: Target,
      title: 'Chasing Dreams',
      description: 'Achieving your dreams requires effort, determination, and ambition. France provides the perfect environment to turn aspirations into reality.',
      color: 'from-[#FFA500] to-[#FF8C00]'
    },
    {
      icon: Globe,
      title: 'Global Exposure',
      description: 'Experience a multicultural environment, learn new perspectives, and build an international network that lasts a lifetime.',
      color: 'from-[#FFC800] to-[#FFD700]'
    }
  ]

  const programs = [
    { name: "Bachelor's level program", icon: GraduationCap, color: "from-[#FFC800] to-[#FFA500]" },
    { name: "Master's level program", icon: Award, color: "from-[#FFD700] to-[#FFC800]" },
    { name: "Doctoral level program", icon: BookOpen, color: "from-[#FFA500] to-[#FF8C00]" },
    { name: "English Taught program", icon: Globe, color: "from-[#FFC800] to-[#FFD700]" },
    { name: "Art and Architecture program", icon: Palette, color: "from-[#FFD700] to-[#FFA500]" },
    { name: "Cultural Short program", icon: Users, color: "from-[#FFA500] to-[#FFC800]" },
    { name: "Language Stay Program", icon: Languages, color: "from-[#FFC800] to-[#FF8C00]" },
    { name: "Online Degree Program", icon: Laptop, color: "from-[#FFD700] to-[#FFC800]" },
  ]

  return (
    <section id="students" ref={glowRef} className="relative overflow-hidden">
      {/* Part 1: Quality of Higher Education with aeroplane bg */}
      <div className="relative py-24">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/quality-higher-education-france.webp"
            alt="Quality of Higher Education in France - Student Visa Assistance"
            fill
            className="object-cover object-[15%_50%] md:object-center opacity-80 scale-55 md:scale-100"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        {/* Dynamic Glow Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#FFC800] font-semibold text-lg mb-4 block">For Students</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Quality of Higher Education in France
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Discover the exceptional opportunities awaiting Indian students in France's
              prestigious educational institutions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-[#FFC800]/30 transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <benefit.icon className="h-8 w-8 text-black" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Part 2: FINDING YOUR RIGHT PROGRAM IS EASY with background */}
      <div ref={glowRef2} className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/french-university-programs-directory.webp"
            alt="French University Programs Directory for Indian Students"
            fill
            className="object-cover object-[25%_center] md:object-center opacity-40 scale-45 md:scale-100"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        {/* Dynamic Glow Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-[#FFC800] font-semibold text-lg mb-4 block uppercase tracking-widest">Programs Directory</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              FINDING YOUR RIGHT PROGRAM IS EASY
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Get personalized advice from VolGO to match your interests, skills, and career aspirations with the right programs.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {programs.map((prog, index) => (
              <motion.div
                key={prog.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#FFC800]/40 rounded-2xl p-6 flex flex-col items-center text-center justify-center gap-4 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prog.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <prog.icon className="h-6 w-6 text-black" />
                </div>
                <span className="text-white font-bold text-sm md:text-base leading-snug">
                  {prog.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ReasonsSection() {
  const glowRef = useMouseGlow()
  const franceReasons = [
    'World-Class Education',
    'Affordable Tuition Fees',
    'International Students Scholarships',
    'Vibrant Student Life',
    'Rich Cultural Heritage',
    'Multilingual Opportunities',
    'Strong Career Prospects',
    'International Recognition',
    'Post-Study Work Opportunities',
    'Quality of Life',
  ]

  const volgoReasons = [
    'Check Eligibility and Requirements',
    'Research and Choosing Program',
    'Student and Parents Counselling',
    'Complete Application Process',
    'Secure Admission and Accommodation',
    'Financial Planning and Student Visa',
    'Pre-Departure and Post Arrival in France',
    'Integrate into French Administration',
    'Organised Academic Schedules',
    'Explore Opportunities and Future',
  ]

  return (
    <section id="reasons" ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/reasons-to-choose-france.webp"
          alt="Reasons to Choose France for Higher Education"
          fill
          className="object-cover object-[50%_center] md:object-center opacity-80 scale-25 md:scale-100"
        />
        <div className="absolute inset-0 bg-black/40" />
        {/* Dynamic Glow Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* France Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Reasons to Choose <span className="text-[#FFC800]">France</span> for Higher Studies
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {franceReasons.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-3 h-3 rounded-full bg-[#FFC800] shrink-0" />
                <span className="text-gray-300 text-lg font-medium">{reason}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Volgo Section */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Reasons to Choose <span className="text-[#FFC800]">VolGO</span> for Studies in France
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {volgoReasons.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-3 h-3 rounded-full bg-[#FFC800] shrink-0" />
                <span className="text-gray-300 text-lg font-medium">{reason}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BlogsSection({ initialBlogs }: { initialBlogs: any[] }) {
  const [blogs, setBlogs] = useState<any[]>(initialBlogs || []);
  const [activeBlog, setActiveBlog] = useState<any | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const glowRef = useMouseGlow()

  useEffect(() => {
    if (activeBlog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeBlog]);

  const visibleBlogs = isExpanded ? blogs : blogs.slice(0, 3);

  return (
    <section id="blogs" ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Dynamic Glow Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#FFC800] font-semibold text-lg mb-4 block">Our Blog</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Latest Insights & Guides
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Stay updated with expert advice, tips, and information about studying in France.
          </p>
        </motion.div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No blog posts available at the moment.
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleBlogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="bg-white/5 backdrop-blur-sm border-t-4 border-t-[#FFC800] border-x border-b border-white/10 hover:border-[#FFC800]/50 transition-all duration-300 overflow-hidden group flex flex-col h-full">
                    {blog.image && (
                      <div 
                        className="relative w-full h-48 sm:h-52 overflow-hidden cursor-pointer bg-black/40"
                        onClick={() => setActiveBlog(blog)}
                      >
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-[#FFC800] font-bold uppercase bg-[#FFC800]/10 border border-[#FFC800]/20 rounded-full px-3 py-1">
                          {blog.majorTag || blog.tags?.[0] || 'Education'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" aria-label="Date" />
                        <span className="text-sm text-gray-400">{blog.date}</span>
                      </div>
                      <h3
                        onClick={() => setActiveBlog(blog)}
                        className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-[#FFC800] cursor-pointer transition-colors"
                      >
                        {blog.title}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-3 flex-grow">
                        {blog.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags?.map((tag: string, index: number) => (
                          <span key={index} className="text-xs text-[#FFC800]/50 bg-black/20 rounded px-2 py-1">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-sm text-gray-400">{blog.readTime}</span>
                        <button
                          onClick={() => setActiveBlog(blog)}
                          className="text-sm text-[#FFC800] font-medium hover:text-[#FFD700] transition-colors cursor-pointer"
                        >
                          Read More →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {blogs.length > 3 && (
              <div className="flex justify-center mt-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="bg-[#FFC800] hover:bg-[#FFD700] text-black font-bold px-8 py-4 transition-all duration-300 shadow-lg shadow-[#FFC800]/20"
                  >
                    {isExpanded ? 'Show Less' : 'View All Insights'}
                  </Button>
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reader Modal overlay */}
      <AnimatePresence>
        {activeBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 blog-overlay-backdrop backdrop-blur-sm"
            onClick={() => setActiveBlog(null)}
          >
            {/* Close button outside the blog card */}
            <button
              onClick={() => setActiveBlog(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-stone-300 hover:text-white transition-colors cursor-pointer p-2 bg-black/40 hover:bg-black/65 rounded-full border border-white/15 shadow-xl z-[160]"
              aria-label="Close blog reader"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto parchment-paper border border-stone-300/60 rounded-2xl p-6 md:p-10 text-stone-900 shadow-2xl scrollbar-thin scrollbar-thumb-stone-300"
              onClick={(e) => e.stopPropagation()}
            >

              {activeBlog.image && (
                <img
                  src={activeBlog.image}
                  alt={activeBlog.title}
                  className="w-full h-auto max-h-[450px] object-contain rounded-xl mb-6 border border-stone-300/40 bg-stone-100/40"
                />
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {activeBlog.tags?.map((tag: string, index: number) => (
                  <span key={index} className="text-xs text-stone-700 font-bold uppercase bg-stone-900/5 border border-stone-900/15 rounded-full px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mt-2 mb-4 leading-tight">
                {activeBlog.title}
              </h2>
              <div className="flex gap-4 text-stone-600 text-sm mb-8 pb-4 border-b border-stone-300/50">
                <span>{activeBlog.date}</span>
                <span>•</span>
                <span>{activeBlog.readTime}</span>
              </div>

              <div
                suppressHydrationWarning
                className="prose prose-stone max-w-none google-doc-content text-stone-900 pb-10"
                dangerouslySetInnerHTML={{ 
                  __html: typeof window !== 'undefined' 
                    ? DOMPurify.sanitize(activeBlog.content || `<p>${activeBlog.excerpt}</p>`) 
                    : (activeBlog.content || `<p>${activeBlog.excerpt}</p>`)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Safe helper to decode base64 strings both server-side and client-side to prevent scraper harvesting
const decodeStr = (str: string) => {
  if (typeof window !== 'undefined') {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString('utf-8');
};

// Contact Section
function ContactSection() {
  const glowRef = useMouseGlow()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format message for WhatsApp
    const messageText = `*New Contact Form Submission - VolGO Student*\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Email:* ${formData.email}\n` +
      `*Phone:* ${formData.phone}\n\n` +
      `*Message:*\n${formData.message}`;

    // Obfuscated WhatsApp number (+91 95005 08790) to prevent scraper harvesting
    const target = decodeStr('OTE4Nzc4MTA4Nzcw');
    const whatsappUrl = `https://wa.me/${target}?text=${encodeURIComponent(messageText)}`;

    // Open WhatsApp Click to Chat URL in a new window/tab
    window.open(whatsappUrl, '_blank');

    // Reset form data
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
  }

  return (
    <section id="contact" ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Dynamic Glow Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 500px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 200, 0, 0.22), transparent 70%)'
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#FFC800] font-semibold text-lg mb-4 block">Contact Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Get in <span className="text-[#FFC800]">Touch</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            We're here to help you succeed! Our team is ready to provide detailed guidance
            and answer all your questions, ensuring a smooth and informed journey toward
            your education in France.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC800] to-[#FFA500] flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Email Us</h3>
                <p className="text-gray-400">Student@volgo-india.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC800] to-[#FFA500] flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Call Us</h3>
                <p className="text-gray-400">+91 87781 08770</p>
                <p className="text-gray-400">+91 95005 08790</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC800] to-[#FFA500] flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Visit Us</h3>
                <p className="text-gray-400">
                  VolGO Student,<br />
                  No. 128 Chetty Street, Heritage Town,<br />
                  Pondicherry - 605 001
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-8">
              <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/volgo.students/' },
                  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/volgo.student/' },
                  { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/@VolGo_Students' },
                  { name: 'Telegram', icon: TelegramIcon, url: 'https://t.me/Volgo_students' },
                  { name: 'WhatsApp', icon: WhatsappIcon, url: 'https://whatsapp.com/channel/0029VbD6U6R0lwgqw0BhZg1h' }
                ].map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFC800] transition-colors group"
                  >
                    <social.icon className="h-5 w-5 text-white group-hover:text-black" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="text-white font-medium mb-2 block">Full Name</label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800]"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="emailAddress" className="text-white font-medium mb-2 block">Email</label>
                      <Input
                        id="emailAddress"
                        type="email"
                        placeholder="your@email.com"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800]"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="text-white font-medium mb-2 block">Phone</label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800]"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="messageContent" className="text-white font-medium mb-2 block">Message</label>
                    <Textarea
                      id="messageContent"
                      placeholder="How can we help you?"
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800] resize-none"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-[#FFC800] hover:bg-[#FFD700] text-black font-bold py-6 text-lg"
                    >
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


function Footer() {
  const [activeLegal, setActiveLegal] = useState<{
    title: string;
    doc_type: string;
    pdf_url?: string;
    pages: string[];
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<'privacy' | 'terms' | null>(null);
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 2.5));
  const zoomOut = () => setZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 1));
  const resetZoom = () => setZoom(1);

  const fetchLegal = async (type: 'privacy' | 'terms') => {
    setZoom(1);
    setIsLoading(type);
    try {
      const res = await fetch(`/api/legal?type=${type}&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      const fallbackPdf = type === 'privacy' ? '/documents/privacy/privacy-policy.pdf' : '/documents/terms/terms-and-conditions.pdf';
      if (data) {
        setActiveLegal({
          title: data.title || (type === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'),
          doc_type: data.doc_type || type,
          pdf_url: data.pdf_url || fallbackPdf,
          pages: (data.pages && data.pages.length > 0)
            ? data.pages
            : [`/documents/${type}/page-1.jpg`, `/documents/${type}/page-2.jpg`],
          content: data.content || ''
        });
      } else {
        alert('Failed to load document');
      }
    } catch (err) {
      console.error(err);
      setActiveLegal({
        title: type === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions',
        doc_type: type,
        pdf_url: type === 'privacy' ? '/documents/privacy/privacy-policy.pdf' : '/documents/terms/terms-and-conditions.pdf',
        pages: [`/documents/${type}/page-1.jpg`, `/documents/${type}/page-2.jpg`],
        content: ''
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <footer className="relative bg-white border-t border-gray-200 py-12 z-[110]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <img src="/volgo-student-logo-main.png" alt="VolGo Student Consultancy Logo" width={200} height={144} className="h-36 w-auto" />
          </div>

          <div>
            <h4 className="text-[#B8860B] font-bold text-lg mb-4">Registered Office</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              VolGo Student,<br />
              36C/5, ST-2, Madurai Main Road,<br />
              Nilakkottai, Dindigul 624 208<br />
              Tamil Nadu, India
            </p>
          </div>

          <div>
            <h4 className="text-[#B8860B] font-bold text-lg mb-4">Contact Us</h4>
            <div className="text-gray-700 text-sm space-y-1">
              <p><span className="text-gray-500">Mobile</span><span className="mx-2">:</span>+91 87781 08770</p>
              <p><span className="text-gray-500">Phone</span><span className="mx-2">:</span>+91 95005 08790</p>
              <p><span className="text-gray-500">Email</span><span className="mx-2">:</span>{decodeStr('U3R1ZGVudEB2b2xnby1pbmRpYS5jb20=')}</p>
              <p><span className="text-gray-500">Web</span><span className="mx-3">:</span>www.volgo-student.com</p>
            </div>
          </div>

          <div>
            <h4 className="text-[#B8860B] font-bold text-lg mb-4">Working Hours</h4>
            <div className="text-gray-700 text-sm leading-relaxed">
              <p>10AM to 6PM,</p>
              <p>Monday to Saturday</p>
              <p>(based on appointments)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-center text-sm">
            © ALL RIGHTS RESERVED BY VOLGO TRAVEL OPC PRIVATE LIMITED @ 2025 - Present
          </p>
          <div className="flex gap-6">
            <button 
              onClick={(e) => { e.preventDefault(); fetchLegal('privacy'); }}
              disabled={isLoading !== null}
              className="text-gray-600 hover:text-[#B8860B] transition-colors text-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading === 'privacy' && <Loader2 className="w-3 h-3 animate-spin" />}
              Privacy
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); fetchLegal('terms'); }}
              disabled={isLoading !== null}
              className="text-gray-600 hover:text-[#B8860B] transition-colors text-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading === 'terms' && <Loader2 className="w-3 h-3 animate-spin" />}
              Terms
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modal Overlay */}
      <AnimatePresence>
        {activeLegal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-[100dvh] z-[150] flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 blog-overlay-backdrop backdrop-blur-sm"
            onClick={() => { setActiveLegal(null); setZoom(1); }}
          >
            {/* Top Toolbar */}
            <div 
              className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 mb-2 px-1 z-[160]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                <span className="text-xs sm:text-sm font-semibold text-stone-200 uppercase tracking-wider truncate drop-shadow">
                  {activeLegal.title}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium bg-white/10 text-stone-300 border border-white/15 px-2 py-0.5 rounded-full select-none flex-shrink-0">
                  Scanned Copy
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                {/* Zoom Controls for Mobile */}
                <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg border border-white/15 px-1 py-0.5 text-xs text-white">
                  <button
                    onClick={zoomOut}
                    disabled={zoom <= 1}
                    className="p-1 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Zoom out"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-1.5 py-0.5 text-[10px] sm:text-[11px] font-mono text-stone-300 hover:text-white cursor-pointer select-none"
                    title="Reset zoom"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={zoomIn}
                    disabled={zoom >= 2.5}
                    className="p-1 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Zoom in"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {activeLegal.pdf_url && (
                  <a
                    href={activeLegal.pdf_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#FFC800] hover:bg-[#e6b400] text-black font-semibold text-xs rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
                    title="Download current official PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden text-[11px]">PDF</span>
                  </a>
                )}

                <button
                  onClick={() => { setActiveLegal(null); setZoom(1); }}
                  className="text-stone-300 hover:text-white transition-colors cursor-pointer p-1.5 bg-black/50 hover:bg-black/75 rounded-full border border-white/20 shadow-xl"
                  aria-label="Close document reader"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile helper hint */}
            <div className="w-full max-w-4xl flex items-center justify-between px-2 text-[10px] text-stone-400 sm:hidden select-none -mt-1 mb-1">
              <span>Scroll down for Page 2</span>
              <span>Tap or use +/- to zoom</span>
            </div>

            {/* Document Scroll Area */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl flex-1 max-h-[88vh] sm:max-h-[85vh] overflow-y-auto overflow-x-auto bg-stone-900/95 sm:bg-stone-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-1 sm:p-4 md:p-6 scrollbar-thin scrollbar-thumb-stone-500 touch-pan-x touch-pan-y"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="flex flex-col gap-3 sm:gap-6 items-center mx-auto transition-all duration-200 ease-out"
                style={{ width: `${zoom * 100}%`, minWidth: `${zoom * 100}%` }}
              >
                {activeLegal.pages?.map((pageUrl: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="w-full bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden border border-stone-200 cursor-zoom-in sm:cursor-default"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        setZoom(prev => prev > 1 ? 1 : 1.4);
                      }
                    }}
                  >
                    <img
                      src={pageUrl}
                      alt={`${activeLegal.title} - Page ${idx + 1}`}
                      className="w-full h-auto object-contain block select-none"
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  )
}

// Main Page Component
export default function HomeClient({ initialBlogs }: { initialBlogs: any[] }) {
  const [isMobile, setIsMobile] = useState(true) // Default true for mobile-first hydration

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <main className="relative bg-black min-h-screen">
      {!isMobile && <BackgroundPlanes />}
      <Navigation />
      <HeroSection />
      <PathToSuccessSection />
      <StatsSection />
      <AboutSection />
      <SafePassageTimeline />
      <StudentsSection />
      <DynamicInteractiveMap />
      <ReasonsSection />
      <BlogsSection initialBlogs={initialBlogs} />
      <ContactSection />
      <Footer />
    </main>
  )
}

