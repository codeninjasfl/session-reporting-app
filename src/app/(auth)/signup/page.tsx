'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signup } from './actions'
import { LucidePlus, LucideMinus, LucideUsers } from 'lucide-react'
import ChildNameInput from '@/components/ChildNameInput'

const initialState = {
    error: '',
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, initialState)
    const [childCount, setChildCount] = useState(1)
    const [location, setLocation] = useState('')

    const addChild = () => {
        if (childCount < 5) setChildCount(c => c + 1)
    }

    const removeChild = () => {
        if (childCount > 1) setChildCount(c => c - 1)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 animate-in fade-in" style={{ background: 'linear-gradient(180deg, var(--bg1), var(--bg2))' }}>
            <div className="cn-card w-full max-w-md space-y-8 p-8 border-t-4 border-[var(--brand)] animate-in slide-in-up delay-100">
                <div className="text-center flex flex-col items-center">
                    <Link href="/">
                        <img
                            src="https://www.codeninjas.com/hubfs/Group%201.svg"
                            alt="Code Ninjas"
                            className="h-12 w-auto mb-4 hover:scale-105 transition-transform"
                        />
                    </Link>
                    <h2 className="text-2xl font-extrabold text-[var(--foreground)] uppercase tracking-tight animate-in slide-in-up delay-150">
                        Create Parent Account
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)] animate-in slide-in-up delay-200">
                        Join to track your ninja's progress
                    </p>
                </div>

                <form action={formAction} className="mt-8 space-y-6 animate-in slide-in-up delay-300">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900">
                                Parent Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                                Dojo Location
                            </label>
                            <div className="mt-1">
                                <select
                                    id="location"
                                    name="location"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3 bg-white"
                                >
                                    <option value="">Select your dojo...</option>
                                    <option value="Cooper City">Cooper City</option>
                                    <option value="Weston">Weston</option>
                                    <option value="Aventura">Aventura</option>
                                </select>
                            </div>
                        </div>

                        {/* Children Section */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <LucideUsers className="h-5 w-5 text-[var(--brand)]" />
                                    <label className="block text-sm font-medium leading-6 text-gray-900">
                                        Your Children ({childCount})
                                    </label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={removeChild}
                                        disabled={childCount <= 1}
                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <LucideMinus className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <span className="w-6 text-center font-bold text-gray-700">{childCount}</span>
                                    <button
                                        type="button"
                                        onClick={addChild}
                                        disabled={childCount >= 5}
                                        className="p-1.5 rounded-lg bg-[var(--brand)] hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <LucidePlus className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Hidden field to pass child count */}
                            <input type="hidden" name="childCount" value={childCount} />

                            <div className="space-y-3">
                                {Array.from({ length: childCount }, (_, i) => (
                                    <ChildNameInput key={i} index={i} location={location} />
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Start typing to search for existing ninjas, or enter a new name.
                            </p>
                        </div>
                    </div>

                    {state?.error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{state.error}</div>
                        </div>
                    )}

                    {/* Terms Checkbox */}
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-gray-500">
                                I agree to the <Link href="/terms" className="font-semibold text-[var(--brand)] hover:underline" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-[var(--brand)] hover:underline" target="_blank">Privacy Policy</Link>
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full justify-center px-5 py-3 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Creating Account...' : 'Start Tracking'}
                        </button>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold leading-6 text-[var(--brand)] hover:text-blue-500">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
