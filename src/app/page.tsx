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
  Calendar
} from 'lucide-react'

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

    // Initialize particles
    const colors = ['#FFC800', '#FFD700', '#FFA500', '#FF8C00', '#FFE4B5']
    const particleCount = 60

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

// Background planes moving randomly
function BackgroundPlanes() {
  const planes = [
    { id: 1, x: ['-20vw', '120vw'], y: ['15vh', '15vh'], rotate: 90, duration: 35, delay: 0, scale: 0.08, opacity: 0.5 },
    { id: 2, x: ['120vw', '-20vw'], y: ['45vh', '45vh'], rotate: 270, duration: 42, delay: 8, scale: 0.06, opacity: 0.45 },
    { id: 3, x: ['-20vw', '120vw'], y: ['70vh', '70vh'], rotate: 90, duration: 38, delay: 15, scale: 0.07, opacity: 0.5 },
    { id: 4, x: ['120vw', '-20vw'], y: ['85vh', '85vh'], rotate: 270, duration: 45, delay: 22, scale: 0.05, opacity: 0.4 }
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      {planes.map((plane) => (
        <motion.img
          key={plane.id}
          src="/images/topview.webp"
          alt="Floating Plane"
          className="absolute"
          style={{
            width: '200px',
            height: 'auto',
            transformOrigin: 'center',
            opacity: plane.opacity
          }}
          animate={{
            x: plane.x,
            y: plane.y,
            rotate: [plane.rotate, plane.rotate],
            scale: plane.scale
          }}
          transition={{
            duration: plane.duration,
            delay: plane.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

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
      { name: 'About', href: '#about' },
      { name: 'Blogs', href: '#blogs' },
      { name: 'Contact', href: '#contact' },
      { name: 'Home', href: '#home' },
      { name: 'Students', href: '#students' },
    ]

  return (
     <motion.nav
       initial={{ y: -100 }}
       animate={{ y: 0 }}
       className={`fixed top-0 left-0 right-0 z-[110] transition-all duration-300 ${
         isScrolled ? 'bg-white shadow-lg' : 'bg-white'
       }`}
     >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
           <motion.div 
             className="flex items-center gap-3"
             whileHover={{ scale: 1.02 }}
           >
             <img 
               src="/logo.png" 
               alt="VolGO Logo" 
               className="h-16 w-auto"
             />
           </motion.div>

           {/* Desktop Navigation */}
           <div className="hidden md:flex items-center gap-8">
             {navItems.map((item) => (
               <motion.a
                 key={item.name}
                 href={item.href}
                 className="text-black/80 hover:text-[#FFC800] transition-colors font-medium relative group"
                 whileHover={{ y: -2 }}
               >
                 {item.name}
                 <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFC800] transition-all group-hover:w-full" />
               </motion.a>
             ))}
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Button className="bg-[#FFC800] hover:bg-[#FFD700] text-black font-semibold px-6">
                 Get Started
               </Button>
             </motion.div>
           </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         {item.name}
                       </a>
                     ))}
                     <Button className="w-full bg-[#FFC800] hover:bg-[#FFD700] text-black font-semibold">
                       Get Started
                     </Button>
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
        <img 
          src="/images/heropage.webp" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-80"
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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 bg-[#FFC800]/20 border border-[#FFC800]/30 rounded-full text-[#FFC800] text-sm font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(255,200,0,0.1)]">
            Empowering Indian Students Since 2025
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-md"
        >
          Our on-ground experience in France is your path to academic journey
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="bg-[#FFC800] hover:bg-[#FFD700] text-black font-bold px-8 py-6 text-lg shadow-lg shadow-[#FFC800]/25 transition-all duration-300">
              Start Your Journey
              <Send className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300">
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-8 w-8 text-[#FFC800]" />
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
        <img 
          src="/images/path-to-success-user.webp" 
          alt="Path to Success Background" 
          className="w-full h-full object-cover opacity-80"
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
            YOUR PATH TO SUCCESS...
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
    { icon: GraduationCap, value: 500, suffix: '+', label: 'Students Guided' },
    { icon: Globe, value: 50, suffix: '+', label: 'Partner Universities' },
    { icon: Award, value: 98, suffix: '%', label: 'Success Rate' },
    { icon: Users, value: 15, suffix: '+', label: 'Expert Counselors' },
  ]

  return (
    <section className="relative py-16 bg-[#FFC800]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <stat.icon className="h-10 w-10 mx-auto mb-3 text-black" />
              <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-black/70 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// About Section
function AboutSection() {
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
    <section id="about" className="relative py-24 bg-black overflow-hidden">
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
            VolGO is a brand new registered company in 2025 with the vision of being your trusted 
            partner in achieving academic excellence and realizing your dreams of higher education 
            in France. With a passion for empowering students, we specialize in providing expert 
            guidance for studying in France.
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
        <img 
          src="/images/roadmap.webp" 
          alt="Roadmap Background" 
          className="w-full h-full object-cover opacity-80"
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

  return (
    <section id="students" ref={glowRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/aeroplane.webp" 
          alt="Quality of Higher Education in France Background" 
          className="w-full h-full object-cover opacity-80"
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
    </section>
  )
}

function ReasonsToChooseFranceSection() {
  const reasons = [
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

  return (
    <section className="relative py-24 bg-black overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#FFC800] mb-4 leading-tight">
            REASONS TO CHOOSE FRANCE FOR HIGHER STUDIES...
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
          {reasons.map((reason, index) => (
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
    </section>
  )
}

function ReasonsToChooseVolgoSection() {
  const reasons = [
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
    <section className="relative py-24 bg-black overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#FFC800] mb-4 leading-tight">
            REASONS TO CHOOSE VOLGO FOR STUDIES IN FRANCE...
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
          {reasons.map((reason, index) => (
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
    </section>
  )
}

// Blogs Section
function BlogsSection() {
   const blogs = [
     {
       id: 1,
       title: "Why Choose France for Higher Education?",
       excerpt: "Discover the benefits of studying in France, from world-class universities to rich cultural experiences and excellent career opportunities.",
       image: "/images/blog-france.png",
       date: "May 10, 2026",
       readTime: "5 min read",
       tags: ["Study Abroad", "France", "Education"]
     },
     {
       id: 2,
       title: "Top 10 Universities in France for Indian Students",
       excerpt: "Explore the best French universities that offer excellent programs for international students, including admission requirements and scholarship opportunities.",
       image: "/images/blog-universities.png",
       date: "May 5, 2026",
       readTime: "7 min read",
       tags: ["University Guide", "Admissions", "Rankings"]
     },
     {
       id: 3,
       title: "Student Life in France: What to Expect",
       excerpt: "Learn about accommodation, cost of living, cultural adaptation, and work opportunities for international students in France.",
       image: "/images/blog-student-life.png",
       date: "April 28, 2026",
       readTime: "6 min read",
       tags: ["Student Life", "Cost of Living", "Culture"]
     }
   ];

  return (
    <section id="blogs" className="relative py-24 bg-black overflow-hidden">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: blog.id * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-white/5 backdrop-blur-sm border-t-4 border-t-[#FFC800] border-x border-b border-white/10 hover:border-[#FFC800]/50 transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-[#FFC800] font-bold uppercase bg-[#FFC800]/10 border border-[#FFC800]/20 rounded-full px-3 py-1">
                      {blog.tags[0]}
                    </span>
                  </div>
                   <div className="flex items-center gap-2 mb-2">
                     <Calendar className="h-4 w-4 text-gray-400" aria-label="Date" />
                     <span className="text-sm text-gray-400">{blog.date}</span>
                   </div>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-[#FFC800] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="text-xs text-[#FFC800]/50 bg-black/20 rounded px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{blog.readTime}</span>
                    <a href="#" className="text-sm text-[#FFC800] font-medium hover:text-[#FFD700] transition-colors">
                      Read More →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Section
function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <section id="contact" className="relative py-24 bg-black overflow-hidden">
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
                <p className="text-gray-400">info@volgostudent.com</p>
                <p className="text-gray-400">support@volgostudent.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC800] to-[#FFA500] flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Call Us</h3>
                <p className="text-gray-400">+91 98765 43210</p>
                <p className="text-gray-400">+91 98765 43211</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC800] to-[#FFA500] flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Visit Us</h3>
                <p className="text-gray-400">Mumbai, Maharashtra, India</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-8">
              <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {['Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((social) => (
                  <motion.div
                    key={social}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-[#FFC800] transition-colors group"
                  >
                    <Globe className="h-5 w-5 text-white group-hover:text-black" />
                  </motion.div>
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
                    <label className="text-white font-medium mb-2 block">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800]"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800]"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-white font-medium mb-2 block">Phone</label>
                      <Input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800]"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="How can we help you?"
                      rows={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#FFC800] resize-none"
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

// Footer
function Footer() {
  return (
    <footer className="relative bg-white border-t border-gray-200 py-12 z-[110]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <img src="/logo.png" alt="VolGO Logo" className="h-36 w-auto" />
          </div>

          <div>
            <h4 className="text-[#B8860B] font-bold text-lg mb-4">Registered Office</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              VolGO Travel (OPC) Private Limited,<br />
              36C/5, ST-2, Madurai Main Road,<br />
              Nilakkottai, Dindigul 624 208<br />
              Tamil Nadu, India
            </p>
          </div>

          <div>
            <h4 className="text-[#B8860B] font-bold text-lg mb-4">Contact Us</h4>
            <div className="text-gray-700 text-sm space-y-1">
              <p><span className="text-gray-500">Mobile</span><span className="mx-2">:</span>+91 877 810 877 0</p>
              <p><span className="text-gray-500">Phone</span><span className="mx-2">:</span>+91 45 43 233 811</p>
              <p><span className="text-gray-500">Email</span><span className="mx-2">:</span>Student@volgo-india.com</p>
              <p><span className="text-gray-500">Web</span><span className="mx-3">:</span>www.volgo-india.com</p>
            </div>
          </div>

          <div>
            <h4 className="text-[#B8860B] font-bold text-lg mb-4">Working Hours</h4>
            <div className="text-gray-700 text-sm leading-relaxed">
              <p>Monday to Saturday</p>
              <p>9:30 AM to 5:50 PM</p>
              <p className="text-gray-500 text-xs mt-2">*Except India Public Holiday</p>
              <p className="text-gray-500 text-xs">Video Conference is available</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-center text-sm">
            © ALL RIGHTS RESERVED BY VOLGO TRAVEL OPC PRIVATE LIMITED @ 2025
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-[#B8860B] transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-600 hover:text-[#B8860B] transition-colors text-sm">Terms</a>
            <a href="#" className="text-gray-600 hover:text-[#B8860B] transition-colors text-sm">Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function Home() {
   return (
      <main className="relative bg-black min-h-screen">
        <ParticleField />
        <BackgroundPlanes />
        <Navigation />
        <HeroSection />
        <PathToSuccessSection />
        <StatsSection />
        <AboutSection />
        <SafePassageTimeline />
        <StudentsSection />
        <ReasonsToChooseFranceSection />
        <ReasonsToChooseVolgoSection />
        <BlogsSection />
        <ContactSection />
        <Footer />
      </main>
   )
}
