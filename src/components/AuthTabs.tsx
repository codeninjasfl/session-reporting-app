'use client'

import { useState } from 'react'
import { login, signup } from '@/app/(auth)/login/actions'

export default function AuthTabs({ message }: { message?: string | null }) {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="cn-card w-full max-w-md bg-white p-0 rounded-[20px] shadow-2xl relative overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-colors ${isLogin ? 'text-[var(--brand)] bg-white' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                >
                    Log In
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-colors ${!isLogin ? 'text-[var(--brand)] bg-white' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                >
                    Sign Up
                </button>
            </div>

            <div className="p-8">
                {/* Logo Header */}
                <div className="text-center flex flex-col items-center mb-6">
                    <img
                        src="https://www.codeninjas.com/hubfs/Group%201.svg"
                        alt="Code Ninjas"
                        className="h-10 w-auto mb-3"
                    />
                    <h2 className="text-xl font-extrabold text-[var(--ink)] uppercase tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Parent Registration'}
                    </h2>
                </div>

                <form className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input
                                name="full_name"
                                type="text"
                                required={!isLogin}
                                placeholder="Ninja Parent"
                                className="w-full p-3 rounded-xl border border-[var(--border)] bg-gray-50 focus:ring-2 ring-[var(--highlight)] focus:border-[var(--brand)] transition-all outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="parent@example.com"
                            className="w-full p-3 rounded-xl border border-[var(--border)] bg-gray-50 focus:ring-2 ring-[var(--highlight)] focus:border-[var(--brand)] transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-3 rounded-xl border border-[var(--border)] bg-gray-50 focus:ring-2 ring-[var(--highlight)] focus:border-[var(--brand)] transition-all outline-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            formAction={isLogin ? login : signup}
                            className="w-full py-3.5 rounded-xl bg-[var(--brand)] text-white font-bold uppercase tracking-wide shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none"
                        >
                            {isLogin ? 'Access Dashboard' : 'Create Account'}
                        </button>
                    </div>

                    {message && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
                            {message}
                        </div>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Protected by Code Ninjas Dojo Hub
                    </p>
                </div>
            </div>
        </div>
    )
}
