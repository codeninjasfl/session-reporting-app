'use client'

import { useEffect, useRef } from 'react'

interface AnimateOnScrollProps {
    children: React.ReactNode
    className?: string
    delay?: number
    bleed?: boolean // If true, doesn't translate, just fades
}

export function AnimateOnScroll({
    children,
    className = '',
    delay = 0,
    bleed = false
}: AnimateOnScrollProps) {
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
    }, [])

    return (
        <div
            ref={ref}
            className={`animate-hidden ${bleed ? 'fade-only' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}
