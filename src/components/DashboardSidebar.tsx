'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideLayoutDashboard, LucideUsers, LucideLogOut, LucideNewspaper, LucideImage } from 'lucide-react'
import { signout } from '@/app/(auth)/signout/actions'

type UserProfile = {
    full_name: string | null
    email: string | null
    initial: string
}

export default function DashboardSidebar({ role, user }: { role: string, user?: UserProfile }) {
    const pathname = usePathname()

    const links = []

    if (role === 'sensei') {
        links.push({ name: 'Dojo Info', href: '/info', icon: LucideLayoutDashboard })
        links.push({ name: 'Dojo News', href: '/news', icon: LucideNewspaper })
        links.push({ name: 'Gallery', href: '/gallery', icon: LucideImage })
        links.push({ name: 'Students', href: '/sensei', icon: LucideUsers })
        links.push({ name: 'Upload Ninjas', href: '/sensei/upload', icon: LucideLayoutDashboard })
    } else if (role === 'parent') {
        links.push({ name: 'Dojo Info', href: '/info', icon: LucideLayoutDashboard })
        links.push({ name: 'Dojo News', href: '/news', icon: LucideNewspaper })
        links.push({ name: 'Gallery', href: '/gallery', icon: LucideImage })
        links.push({ name: 'Session Cards', href: '/parent', icon: LucideUsers })
    } else if (role === 'director') {
        links.push({ name: 'Dojo Info', href: '/info', icon: LucideLayoutDashboard })
        links.push({ name: 'Dojo News', href: '/news', icon: LucideNewspaper })
        links.push({ name: 'Gallery', href: '/gallery', icon: LucideImage })
        links.push({ name: 'Post News', href: '/director', icon: LucideNewspaper })
        links.push({ name: 'Manage Users', href: '/admin/users', icon: LucideUsers })
    } else if (role === 'franchise_owner') {
        links.push({ name: 'Dojo Info', href: '/info', icon: LucideLayoutDashboard })
        links.push({ name: 'Dojo News', href: '/news', icon: LucideNewspaper })
        links.push({ name: 'Gallery', href: '/gallery', icon: LucideImage })
        links.push({ name: 'Post News', href: '/director', icon: LucideNewspaper }) // Re-use director post page
        links.push({ name: 'Manage Users', href: '/admin/users', icon: LucideUsers })
    }

    return (
        <div className="flex h-full w-64 flex-col glass-dark text-white">
            {/* Logo Header - matching sidebar background */}
            <div className="flex flex-col items-center justify-center border-b border-white/10 py-5 px-6 animate-in fade-in">
                <img
                    src="https://www.codeninjas.com/hubfs/Group%201.svg"
                    alt="Code Ninjas"
                    className="h-12 w-auto drop-shadow-xl transition-transform duration-300 hover:scale-105"
                />
                <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">FL Centers</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-8">
                {links.map((link, index) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            prefetch={true}
                            className={`group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                                : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {link.name}
                            {isActive && (
                                <span className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile & Sign Out */}
            <div className="border-t border-white/10 p-4 animate-in fade-in delay-300 space-y-4">
                {/* User Profile Badge */}
                {user && (
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/10">
                        <div className="h-9 w-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/20">
                            {user.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.full_name || 'User'}</p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                <form action={signout}>
                    <button
                        type="submit"
                        className="group flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-white/70 transition-all duration-300 hover:bg-red-500/20 hover:text-red-300 hover:translate-x-1"
                    >
                        <LucideLogOut className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}
