'use client'

import { useEffect, useState } from 'react'

interface AuthLoadingOverlayProps {
    isVisible: boolean
    message?: string
    type?: 'login' | 'signup'
}

export default function AuthLoadingOverlay({
    isVisible,
    message,
    type = 'login'
}: AuthLoadingOverlayProps) {
    const [dots, setDots] = useState('')

    useEffect(() => {
        if (!isVisible) return

        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.')
        }, 400)

        return () => clearInterval(interval)
    }, [isVisible])

    if (!isVisible) return null

    const defaultMessage = type === 'login' ? 'Signing you in' : 'Creating your account'
    const displayMessage = message || defaultMessage

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative flex flex-col items-center gap-6 p-10 bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Animated Ninja Logo */}
                <div className="relative">
                    {/* Outer pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-[var(--brand)] opacity-20 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-[var(--brand)] opacity-10 animate-pulse" />

                    {/* Spinning circle */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg
                            className="absolute w-full h-full animate-spin"
                            style={{ animationDuration: '1.5s' }}
                            viewBox="0 0 50 50"
                        >
                            <circle
                                className="stroke-[var(--brand)]"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray="90, 150"
                                strokeDashoffset="0"
                                cx="25"
                                cy="25"
                                r="20"
                            />
                        </svg>

                        {/* Ninja icon in center */}
                        <div className="absolute text-3xl animate-bounce" style={{ animationDuration: '1s' }}>
                            🥷
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">
                        {displayMessage}
                        <span className="inline-block w-6 text-left">{dots}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {type === 'login' ? 'Preparing your dojo' : 'Setting up your ninja profile'}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[var(--brand)] via-blue-400 to-[var(--brand)] rounded-full animate-shimmer"
                        style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite linear',
                        }}
                    />
                </div>
            </div>

            {/* Shimmer animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    )
}
