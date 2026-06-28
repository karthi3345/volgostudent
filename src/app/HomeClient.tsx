'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
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
  Loader2
} from 'lucide-react'

import InteractiveMap from '@/components/InteractiveMap'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const DynamicInteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center text-white/50">Loading Map...</div>
})
// Particle types for educational theme
interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  type: 'star' | 'circle' | 'diamond'
  color: string
}

// Floating Particles Component
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const scrollRef = useRef({ lastY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    const colors = ['#FFC800', '#FFD700', '#FFA500', '#FF8C00', '#FFE4B5']
    const particleCount = 35

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        type: ['star', 'circle', 'diamond'][Math.floor(Math.random() * 3)] as 'star' | 'circle' | 'diamond',
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const drawStar = (x: number, y: number, size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const px = x + Math.cos(angle) * size
        const py = y + Math.sin(angle) * size
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    const drawDiamond = (x: number, y: number, size: number) => {
      ctx.beginPath()
      ctx.moveTo(x, y - size)
      ctx.lineTo(x + size, y)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x - size, y)
      ctx.closePath()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate scroll delta
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - scrollRef.current.lastY
      scrollRef.current.lastY = currentScrollY

      particlesRef.current.forEach(particle => {
        // Apply scroll delta drift (parallax effect)
        if (Math.abs(scrollDelta) > 0.1) {
          particle.y -= scrollDelta * 0.15
        }

        particle.x += particle.speedX
        particle.y += particle.speedY

        // Mouse reaction (repulsion and glow)
        if (mouseRef.current.x !== -1000) {
          const dx = particle.x - mouseRef.current.x
          const dy = particle.y - mouseRef.current.y
          const dist = Math.hypot(dx, dy)
          const reactionRadius = 180

          if (dist < reactionRadius && dist > 1) {
            const force = (reactionRadius - dist) / reactionRadius
            const angle = Math.atan2(dy, dx)
            particle.x += Math.cos(angle) * force * 2.5
            particle.y += Math.sin(angle) * force * 2.5
          }
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10

        switch (particle.type) {
          case 'star':
            drawStar(particle.x, particle.y, particle.size)
            ctx.fill()
            break
          case 'diamond':
            drawDiamond(particle.x, particle.y, particle.size)
            ctx.fill()
            break
          default:
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ opacity: 0.55 }}
    />
  )
}

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

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Students', href: '#students' },
    { name: 'Blogs', href: '#blogs' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <img
              src="/volgo-student-logo-main.png"
              alt="VolGo Student Consultancy Logo"
              width={160}
              height={48}
              className="h-12 w-auto"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 justify-end flex-1">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-black/80 hover:text-[#FFC800] transition-colors font-medium relative group cursor-pointer"
                whileHover={{ y: -2 }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFC800] transition-all group-hover:w-full" />
              </motion.a>
            ))}
            <motion.a
              href="https://wa.me/918778108770"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="text-[#25D366] hover:text-[#128C7E] transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <WhatsappIcon className="h-6 w-6" />
            </motion.a>
          </div>

          {/* Mobile Header Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              href="https://wa.me/918778108770"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
              className="text-[#25D366] hover:text-[#128C7E] p-2 cursor-pointer"
            >
              <WhatsappIcon className="h-6 w-6" />
            </a>
            <button
              className="text-black p-2 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-black/80 hover:text-[#FFC800] transition-colors font-medium py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById(item.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// Hero Section
function HeroSection() {
  const glowRef = useMouseGlow()
  return (
    <section id="home" ref={glowRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/study-in-france-consultancy-hero.webp"
          alt="VolGo Student Consultancy - Study Abroad in France"
          fill
          priority
          className="object-cover object-[center_bottom] md:object-center opacity-80 scale-100 md:scale-100"
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
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">


        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-md"
        >
          Our on-ground experience in France is your path to academic journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium italic drop-shadow"
        >
          "Step into the World of French Education with Confidence"
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-block px-3 py-1 bg-[#FFC800]/20 border border-[#FFC800]/30 rounded-full text-[#FFC800] text-xs font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(255,200,0,0.1)]">
            Empowering Indian Students
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-[#FFC800] hover:bg-[#FFD700] text-black font-bold px-8 py-6 text-lg shadow-lg shadow-[#FFC800]/25 transition-all duration-300"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Your Journey
              <Send className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
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
                  className="w-full h-64 md:h-80 object-cover rounded-xl mb-6 border border-stone-300/40"
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
                className="prose prose-stone max-w-none google-doc-content text-stone-900 pb-10"
                dangerouslySetInnerHTML={{ __html: activeBlog.content || `<p>${activeBlog.excerpt}</p>` }}
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
  const [activeLegal, setActiveLegal] = useState<{title: string, content: string} | null>(null);
  const [isLoading, setIsLoading] = useState<'privacy' | 'terms' | null>(null);

  const fetchLegal = async (type: 'privacy' | 'terms') => {
    setIsLoading(type);
    try {
      const res = await fetch(`/api/legal?type=${type}`);
      const data = await res.json();
      if (data.content) {
        setActiveLegal({
          title: type === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions',
          content: data.content
        });
      } else {
        alert(data.error || 'Failed to load document');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load document');
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
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 blog-overlay-backdrop backdrop-blur-sm"
            onClick={() => setActiveLegal(null)}
          >
            <button
              onClick={() => setActiveLegal(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-stone-300 hover:text-white transition-colors cursor-pointer p-2 bg-black/40 hover:bg-black/65 rounded-full border border-white/15 shadow-xl z-[160]"
              aria-label="Close document reader"
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
              <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mt-2 mb-8 pb-4 border-b border-stone-300/50 leading-tight">
                {activeLegal.title}
              </h2>

              <div
                className="prose prose-stone max-w-none google-doc-content text-stone-900 pb-10"
                dangerouslySetInnerHTML={{ __html: activeLegal.content }}
              />
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
      {!isMobile && <ParticleField />}
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

