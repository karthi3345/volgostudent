'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Globe, 
  BookOpen, 
  Users, 
  Plane, 
  Award,
  Mail, 
  Phone, 
  MapPin,
  ChevronDown,
  Menu,
  X,
  Star,
  Target,
  Lightbulb,
  Heart,
  Send,
  CheckCircle,
  Sparkles,
  Building2,
  FileText,
  MessageCircle
} from 'lucide-react';

// Particle Component
const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const createParticle = () => {
      const colors = ['#FFC800', '#FFD700', '#FFA500', '#FFE066', '#FFF3B0'];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };
    
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        
        // Draw connections
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = particle.color;
              ctx.globalAlpha = 0.1 * (1 - distance / 120);
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      });
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    resize();
    initParticles();
    animate();
    
    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

// Floating Elements Component
const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating graduation caps */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`cap-${i}`}
          className="absolute animate-float"
          style={{
            left: `${10 + i * 20}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${6 + i}s`
          }}
        >
          <GraduationCap className="w-8 h-8 text-yellow-400/20" />
        </div>
      ))}
      
      {/* Floating stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.3}s`
          }}
        >
          <Star className="w-4 h-4 text-yellow-300/30" />
        </div>
      ))}
      
      {/* Floating circles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`circle-${i}`}
          className="absolute rounded-full bg-yellow-400/10 animate-float"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            left: `${i * 30}%`,
            top: `${30 + i * 15}%`,
            animationDelay: `${i * 1}s`,
            animationDuration: `${10 + i * 2}s`
          }}
        />
      ))}
    </div>
  );
};

// Eiffel Tower SVG Background
const EiffelTowerBg = () => (
  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
    <svg 
      viewBox="0 0 100 200" 
      className="w-64 h-auto md:w-96"
      fill="currentColor"
    >
      <path d="M50 0 L45 40 L30 40 L25 60 L20 60 L10 200 L15 200 L25 100 L35 100 L30 200 L40 200 L45 120 L55 120 L60 200 L70 200 L65 100 L75 100 L85 200 L90 200 L80 60 L75 60 L70 40 L55 40 L50 0 Z M40 60 L60 60 L62 80 L38 80 Z" />
    </svg>
  </div>
);

// Navigation Component
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Students', href: '#students' },
    { name: 'Contact', href: '#contact' },
  ];
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl md:text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              Vol<span className="text-yellow-400">GO</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`font-medium transition-all duration-300 hover:text-yellow-400 ${
                  isScrolled ? 'text-gray-700' : 'text-white/90 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6"
              onClick={() => scrollToSection('#contact')}
            >
              Get Started
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-96 bg-white shadow-lg' : 'max-h-0'
      }`}>
        <div className="px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className="block w-full text-left py-2 text-gray-700 font-medium hover:text-yellow-500 transition-colors"
            >
              {item.name}
            </button>
          ))}
          <Button 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold mt-4"
            onClick={() => scrollToSection('#contact')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Hero Section
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const mountedRef = useRef(false);
  
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, []);
  
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Particles />
      <FloatingElements />
      <EiffelTowerBg />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Badge className="mb-6 bg-yellow-400/20 text-yellow-300 border-yellow-400/30 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Empowering Indian Students Since 2025
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            YOUR PATH TO
            <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              SUCCESS
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            VolGO is your ultimate partner in navigating the journey of higher education in France. 
            We specialize in providing tailored consultancy services to Indian students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-6 text-lg shadow-2xl shadow-yellow-400/25 hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Journey
              <Plane className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 text-lg transition-all duration-300"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
              <ChevronDown className="ml-2 w-5 h-5 animate-bounce" />
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {[
            { number: '100+', label: 'Universities' },
            { number: '500+', label: 'Students Placed' },
            { number: '98%', label: 'Success Rate' },
            { number: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">{stat.number}</div>
              <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-yellow-400" />
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const values = [
    { icon: Target, title: 'Our Mission', description: 'To be your trusted partner in achieving academic excellence and realizing your dreams of higher education in France.' },
    { icon: Lightbulb, title: 'Our Vision', description: 'To empower every Indian student with the knowledge, resources, and guidance needed to succeed internationally.' },
    { icon: Heart, title: 'Our Values', description: 'Integrity, dedication, and personalized support form the foundation of everything we do for our students.' },
  ];
  
  return (
    <section id="about" ref={sectionRef} className="relative py-20 md:py-32 bg-gradient-to-b from-black via-gray-900 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Badge className="mb-4 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
            About Us
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            WELCOME TO <span className="text-yellow-400">VolGO</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            A brand new registered company in 2025, dedicated to guiding Indian students towards 
            prestigious educational institutions in France with expert consultancy services.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item, index) => (
            <Card 
              key={index}
              className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/10 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/25">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: 'Expert Guidance' },
            { icon: Globe, label: 'Global Network' },
            { icon: Users, label: 'Personal Support' },
            { icon: Award, label: 'Proven Results' },
          ].map((feature, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center p-6 rounded-xl bg-gray-800/30 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <feature.icon className="w-8 h-8 text-yellow-400 mb-3" />
              <span className="text-white font-medium">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const services = [
    {
      icon: FileText,
      title: 'University Applications',
      description: 'Complete assistance with university selection, application preparation, and submission to top French institutions.',
      features: ['Document Preparation', 'Application Review', 'Deadline Management']
    },
    {
      icon: Building2,
      title: 'Visa Assistance',
      description: 'Expert guidance through the French student visa process with high success rate support.',
      features: ['Visa Documentation', 'Interview Prep', 'Follow-up Support']
    },
    {
      icon: GraduationCap,
      title: 'Academic Counseling',
      description: 'Personalized academic planning to match your career goals with the right programs.',
      features: ['Course Selection', 'Career Mapping', 'University Matching']
    },
    {
      icon: MessageCircle,
      title: 'Language Support',
      description: 'French language preparation and English proficiency guidance for your studies.',
      features: ['French Classes', 'IELTS/TOEFL Prep', 'Language Certificates']
    },
  ];
  
  return (
    <section id="services" ref={sectionRef} className="relative py-20 md:py-32 bg-gray-900 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Badge className="mb-4 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
            Our Services
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            How We <span className="text-yellow-400">Help You</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Comprehensive support at every step of your journey to studying in France
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/10 overflow-hidden transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">{service.title}</h3>
                    <p className="text-gray-400 mb-4 leading-relaxed">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, fIndex) => (
                        <Badge key={fIndex} variant="secondary" className="bg-gray-700/50 text-gray-300 border border-gray-600">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Students Section
const StudentsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const benefits = [
    {
      icon: Award,
      title: 'High-Quality Education',
      description: 'France offers top-tier education with globally recognized degrees from prestigious universities.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Flexible Courses',
      description: 'A wide variety of programs available, taught in both English and French to suit your preferences.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Globe,
      title: 'International Exposure',
      description: 'Experience world-class education while immersing yourself in French culture and European lifestyle.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: Users,
      title: 'Diverse Community',
      description: 'Join a vibrant international student community and build lifelong connections across the globe.',
      color: 'from-pink-400 to-pink-600'
    },
  ];
  
  const steps = [
    { step: '01', title: 'Consultation', description: 'Free initial assessment of your profile and goals' },
    { step: '02', title: 'Planning', description: 'Personalized roadmap for your education journey' },
    { step: '03', title: 'Application', description: 'Complete support through the application process' },
    { step: '04', title: 'Success', description: 'Visa approval and pre-departure guidance' },
  ];
  
  return (
    <section id="students" ref={sectionRef} className="relative py-20 md:py-32 bg-gradient-to-b from-gray-900 via-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Badge className="mb-4 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
            For Students
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            QUALITY OF HIGHER EDUCATION IN <span className="text-yellow-400">FRANCE</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Achieving your dreams requires effort, determination, and ambition. 
            We are here to guide you every step of the way.
          </p>
        </div>
        
        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className={`group bg-gray-800/30 border-gray-700 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Steps */}
        <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-2xl font-bold text-white text-center mb-10">
            Your Journey <span className="text-yellow-400">in 4 Steps</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-yellow-400/50 to-transparent" style={{ zIndex: -1 }} />
                )}
                <div className="text-center p-6 rounded-xl bg-gray-800/30 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <div className="text-4xl font-bold text-yellow-400/30 mb-2">{item.step}</div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };
  
  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'info@volgostudent.com', href: 'mailto:info@volgostudent.com' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
    { icon: MapPin, label: 'Location', value: 'Mumbai, India', href: '#' },
  ];
  
  return (
    <section id="contact" ref={sectionRef} className="relative py-20 md:py-32 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Badge className="mb-4 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
            Contact Us
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            GET IN <span className="text-yellow-400">TOUCH</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            We are here to help you succeed! Our team is ready to provide detailed guidance 
            and answer all your questions about studying in France.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className={`bg-gray-800/30 border-gray-700 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <CardContent className="p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                  <p className="text-gray-400">We will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <Input 
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Email</label>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Phone Number</label>
                    <Input 
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Message</label>
                    <Textarea 
                      placeholder="Tell us about your study goals..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-400 resize-none"
                      required
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 text-lg shadow-2xl shadow-yellow-400/25 hover:shadow-yellow-400/40 transition-all duration-300"
                  >
                    Send Message
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          
          {/* Contact Info */}
          <div className={`space-y-6 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {contactInfo.map((item, index) => (
              <a 
                key={index}
                href={item.href}
                className="flex items-center gap-6 p-6 rounded-xl bg-gray-800/30 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="w-14 h-14 rounded-lg bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                  <item.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                  <div className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">{item.value}</div>
                </div>
              </a>
            ))}
            
            {/* Quick Links */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 border border-yellow-400/20">
              <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
              <div className="space-y-3">
                {['University Programs', 'Visa Requirements', 'Scholarship Info', 'Student Testimonials'].map((link, index) => (
                  <button 
                    key={index}
                    className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star className="w-4 h-4 text-yellow-400/50" />
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Vol<span className="text-yellow-400">GO</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <span>&copy; 2025 VolGO Student. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Contact'].map((link, index) => (
              <button 
                key={index}
                className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <StudentsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
