'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface AnimateOnScrollProps {
    children: ReactNode
    className?: string
    delay?: number
    threshold?: number
}

export function AnimateOnScroll({
    children,
    className = '',
    delay = 0,
    threshold = 0.1
}: AnimateOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add('animate-visible')
                            entry.target.classList.remove('animate-hidden')
                        }, delay)
                    }
                })
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [delay, threshold])

    return (
        <div ref={ref} className={`animate-hidden ${className}`}>
            {children}
        </div>
    )
}

// Hook to scroll to top on mount
export function ScrollToTop() {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, [])

    return null
}
