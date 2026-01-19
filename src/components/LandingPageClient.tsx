'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LucideTrophy, LucideLayoutDashboard, LucideUsers, LucideChevronDown, LucideMapPin, LucidePhone, LucideQuote } from 'lucide-react'

// Scroll-triggered animation component
function AnimateOnScroll({
    children,
    className = '',
    delay = 0
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible')
                        entry.target.classList.remove('animate-hidden')
                    } else {
                        entry.target.classList.add('animate-hidden')
                        entry.target.classList.remove('animate-visible')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [delay])

    return (
        <div
            ref={ref}
            className={`animate-hidden ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

export default function LandingPageClient() {
    const [scrollOpacity, setScrollOpacity] = useState(1)

    // Handle scroll-based fades and prevent scroll restoration
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
        window.scrollTo(0, 0)

        const handleScroll = () => {
            const currentScrollY = window.scrollY
            // Fade out the scroll indicator over the first 100px of scroll
            const newOpacity = Math.max(0, 1 - currentScrollY / 100)
            setScrollOpacity(newOpacity)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <AnimateOnScroll delay={100}>
                <nav className="p-6">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <img src="https://www.codeninjas.com/hubfs/Group%201.svg" alt="Logo" className="h-8 md:h-10 w-auto transition-transform duration-500 group-hover:rotate-12" />
                            <span className="hidden md:block font-black text-xl text-white uppercase tracking-tighter">Dojo Hub</span>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all backdrop-blur-sm hover:scale-105 active:scale-95">
                                Log In
                            </Link>
                            <Link href="/signup" className="px-5 py-2.5 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>
            </AnimateOnScroll>

            {/* Hero - Full viewport height so users must scroll to see more */}
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center p-8 pb-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <AnimateOnScroll delay={200} className="animate-float">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md text-sm font-semibold">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            Now available for all South Florida Dojos
                        </div>
                    </AnimateOnScroll>

                    <AnimateOnScroll delay={400}>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-sm leading-tight">
                            Track Every <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Ninja's Journey.</span>
                        </h1>
                    </AnimateOnScroll>

                    <AnimateOnScroll delay={700}>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            The official parent portal for Code Ninjas FL. Stay connected with your ninja's progress at Cooper City, Weston, or Aventura.
                        </p>
                    </AnimateOnScroll>

                    <AnimateOnScroll delay={1000}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/signup" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-[var(--brand)] font-black text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all">
                                Get Started Now
                            </Link>
                        </div>
                    </AnimateOnScroll>

                    {/* Scroll indicator */}
                    <AnimateOnScroll delay={1200}>
                        <div
                            className="pt-12 transition-opacity duration-300"
                            style={{
                                opacity: scrollOpacity,
                                pointerEvents: scrollOpacity === 0 ? 'none' : 'auto'
                            }}
                        >
                            <a href="#features" className="inline-flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group">
                                <span className="text-xs font-semibold uppercase tracking-widest">Scroll to learn more</span>
                                <LucideChevronDown className="h-5 w-5 animate-bounce" />
                            </a>
                        </div>
                    </AnimateOnScroll>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="bg-white py-24 scroll-mt-8">
                <div className="container mx-auto px-6">
                    <AnimateOnScroll className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-4 hover:scale-105 transition-transform cursor-default">Why Parents Love Us</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--ink)] tracking-tight">Stay Connected to Their Progress</h2>
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <AnimateOnScroll delay={100}>
                            <div className="p-8 rounded-[30px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:-translate-y-2 transition-all duration-300 group h-full">
                                <div className="h-14 w-14 rounded-2xl bg-blue-100 text-[var(--brand)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <LucideLayoutDashboard className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Reports On Every Visit</h3>
                                <p className="text-[var(--muted)] leading-relaxed">
                                    Receive a detailed session card after every single visit. Know exactly what projects were built and what concepts were mastered each time.
                                </p>
                            </div>
                        </AnimateOnScroll>

                        {/* Feature 2 */}
                        <AnimateOnScroll delay={200}>
                            <div className="p-8 rounded-[30px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:-translate-y-2 transition-all duration-300 group h-full">
                                <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <LucideTrophy className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Track Progress</h3>
                                <p className="text-[var(--muted)] leading-relaxed">
                                    Visualize their journey through the belts. See completed requirements and exactly how close they are to leveling up.
                                </p>
                            </div>
                        </AnimateOnScroll>

                        {/* Feature 3 */}
                        <AnimateOnScroll delay={300}>
                            <div className="p-8 rounded-[30px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:-translate-y-2 transition-all duration-300 group h-full">
                                <div className="h-14 w-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <LucideUsers className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Sensei Feedback</h3>
                                <p className="text-[var(--muted)] leading-relaxed">
                                    Get direct notes from Senseis about soft skills, collaboration, and determination. It's more than just coding.
                                </p>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
                <div className="container mx-auto px-6">
                    <AnimateOnScroll className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-white text-blue-700 text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">Simple Setup</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--ink)] tracking-tight">How It Works</h2>
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '1', title: 'Sign Up', desc: 'Create your free parent account in under 30 seconds' },
                            { step: '2', title: 'Link Your Ninja', desc: 'Connect to your child\'s profile at your dojo' },
                            { step: '3', title: 'Get Reports', desc: 'Receive session cards after every visit' },
                            { step: '4', title: 'Track Progress', desc: 'Watch them advance through the belt system' },
                        ].map((item, i) => (
                            <AnimateOnScroll key={i} delay={i * 100}>
                                <div className="text-center group">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl font-black flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--ink)] mb-2">{item.title}</h3>
                                    <p className="text-[var(--muted)]">{item.desc}</p>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </div>

            {/* Locations */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-24">
                <div className="container mx-auto px-6">
                    <AnimateOnScroll className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-4">Our Dojos</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--ink)] tracking-tight">3 South Florida Locations</h2>
                        <p className="text-[var(--muted)] text-lg mt-4 max-w-2xl mx-auto">Find the Code Ninjas dojo nearest to you. Each location offers the same amazing curriculum and dedicated Senseis.</p>
                    </AnimateOnScroll>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Cooper City', address: '5534 S Flamingo Rd', city: 'Cooper City, FL 33330', phone: '(954) 323-4555', color: 'from-blue-500 to-blue-700' },
                            { name: 'Weston', address: '1374 SW 160th Ave, Suite E-3/E-4', city: 'Weston, FL 33326', phone: '(954) 727-8797', color: 'from-indigo-500 to-indigo-700' },
                            { name: 'Aventura', address: '18999 Biscayne Blvd, Suite 200', city: 'Aventura, FL 33180', phone: '(786) 592-6300', color: 'from-purple-500 to-purple-700' },
                        ].map((loc, i) => (
                            <AnimateOnScroll key={i} delay={i * 150}>
                                <div className="bg-white rounded-[30px] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group h-full">
                                    <div className={`h-3 bg-gradient-to-r ${loc.color} group-hover:h-4 transition-all duration-300`} />
                                    <div className="p-8">
                                        <h3 className="text-2xl font-black text-[var(--ink)] mb-4">{loc.name}</h3>
                                        <div className="space-y-2 text-[var(--muted)]">
                                            <p className="flex items-center gap-2">
                                                <LucideMapPin className="h-4 w-4 text-blue-500" />
                                                {loc.address}, {loc.city}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <LucidePhone className="h-4 w-4 text-blue-500" />
                                                <a href={`tel:${loc.phone}`} className="hover:text-blue-600 transition-colors">{loc.phone}</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </div>

            {/* Belt System Preview */}
            <div className="bg-white py-24">
                <div className="container mx-auto px-6">
                    <AnimateOnScroll className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold uppercase tracking-wider mb-4 hover:scale-105 transition-transform cursor-default">The Journey</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--ink)] tracking-tight">9 Belts to Master</h2>
                        <p className="text-[var(--muted)] text-lg mt-4 max-w-2xl mx-auto">From White Belt beginner to Black Belt master, every ninja has an exciting path ahead.</p>
                    </AnimateOnScroll>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {[
                            { name: 'White', color: 'bg-gray-100 border-gray-300' },
                            { name: 'Yellow', color: 'bg-yellow-300 border-yellow-500' },
                            { name: 'Orange', color: 'bg-orange-400 border-orange-600' },
                            { name: 'Green', color: 'bg-green-500 border-green-700' },
                            { name: 'Blue', color: 'bg-blue-500 border-blue-700' },
                            { name: 'Purple', color: 'bg-purple-500 border-purple-700' },
                            { name: 'Brown', color: 'bg-amber-700 border-amber-900' },
                            { name: 'Red', color: 'bg-red-600 border-red-800' },
                            { name: 'Black', color: 'bg-gray-900 border-black' },
                        ].map((belt, i) => (
                            <AnimateOnScroll key={i} delay={i * 80} className="flex flex-col items-center group">
                                <div className={`w-16 h-6 md:w-20 md:h-8 rounded-lg border-2 shadow-lg ${belt.color} group-hover:scale-125 group-hover:-rotate-3 transition-all duration-300`} />
                                <span className="mt-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">{belt.name}</span>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial / Quote */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-24 overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <AnimateOnScroll className="max-w-3xl mx-auto">
                        <LucideQuote className="h-12 w-12 text-white/30 mx-auto mb-8 animate-pulse" />
                        <blockquote className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-8">
                            "My son absolutely loves coming to Code Ninjas. The session reports let me see exactly what he's learning, and I can actually have conversations with him about his projects!"
                        </blockquote>
                        <div className="text-white/80 font-semibold">
                            — Parent at Code Ninjas Cooper City
                        </div>
                    </AnimateOnScroll>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-white py-24">
                <div className="container mx-auto px-6 text-center">
                    <AnimateOnScroll>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--ink)] tracking-tight mb-6">Ready to Get Started?</h2>
                    </AnimateOnScroll>
                    <AnimateOnScroll delay={100}>
                        <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto mb-10">
                            Join hundreds of parents who stay connected to their ninja's coding journey. It only takes 30 seconds to sign up.
                        </p>
                    </AnimateOnScroll>
                    <AnimateOnScroll delay={200}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                                Create Free Account
                            </Link>
                            <Link href="/login" className="px-10 py-5 rounded-2xl bg-gray-100 text-[var(--ink)] font-bold text-lg hover:bg-gray-200 hover:scale-105 transition-all duration-300">
                                I Already Have an Account
                            </Link>
                        </div>
                    </AnimateOnScroll>
                </div>
            </div>

            {/* Footer - Light version */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src="https://www.codeninjas.com/hubfs/Group%201.svg" alt="Logo" className="h-8 w-auto" />
                            <span className="font-bold text-[var(--muted)]">Dojo Hub</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
                            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                        </div>
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} Code Ninjas FL. Not officially affiliated with Code Ninjas LLC.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
