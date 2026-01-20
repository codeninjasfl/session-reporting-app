'use client'

import { login } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useTransition, Suspense } from 'react'
import AuthLoadingOverlay from '@/components/AuthLoadingOverlay'

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const email = searchParams.get('email') || ''

    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        startTransition(async () => {
            await login(formData)
            // If we get here, login failed (successful login redirects)
            setIsLoading(false)
        })
    }

    return (
        <>
            <AuthLoadingOverlay isVisible={isLoading || isPending} type="login" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in" style={{ background: 'linear-gradient(180deg, var(--bg1), var(--bg2))' }}>
                <div className="w-full max-w-md animate-in slide-in-up delay-100">
                    {/* Logo outside card */}
                    <div className="text-center mb-6">
                        <Link href="/">
                            <img
                                src="https://www.codeninjas.com/hubfs/Group%201.svg"
                                alt="Code Ninjas"
                                className="h-10 sm:h-14 w-auto mx-auto hover:scale-105 transition-transform"
                            />
                        </Link>
                    </div>

                    {/* White Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="text-center animate-in slide-in-up delay-150">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Sign in to your Dojo Hub account
                            </p>
                        </div>

                        <form action={handleSubmit} className="space-y-5 animate-in slide-in-up delay-200">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email-address" className="block text-sm font-semibold leading-6 text-gray-700">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email-address"
                                            name="email"
                                            type="email"
                                            required
                                            defaultValue={email}
                                            autoComplete="email"
                                            disabled={isLoading}
                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete="current-password"
                                            disabled={isLoading}
                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <Link href="/auth/forgot-password" className="text-sm font-medium text-[var(--brand)] hover:text-blue-700">
                                    Forgot your password?
                                </Link>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 animate-in fade-in border border-red-200">
                                    <div className="text-sm text-red-700 font-medium">{error}</div>
                                </div>
                            )}

                            {message && (
                                <div className="rounded-xl bg-green-50 p-4 animate-in fade-in border border-green-200">
                                    <div className="text-sm text-green-700 font-medium">{message}</div>
                                </div>
                            )}

                            <div className="animate-in slide-in-up delay-300">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex w-full justify-center px-5 py-3.5 rounded-xl bg-[var(--brand)] text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Signing in...
                                        </span>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>

                                <p className="mt-4 text-center text-sm text-gray-500">
                                    New parent?{' '}
                                    <Link href="/signup" className="font-semibold leading-6 text-[var(--brand)] hover:text-blue-700">
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg, var(--bg1), var(--bg2))' }}>
                <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
