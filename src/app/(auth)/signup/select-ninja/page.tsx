'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useState, Suspense } from 'react'
import { LucideUserCheck, LucideUserPlus, LucideCheck } from 'lucide-react'

function SelectNinjaContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const childName = searchParams.get('name') || 'Your Ninja'
    const matchesRaw = searchParams.get('matches') || '[]'
    const matches = JSON.parse(matchesRaw) as { id: string, belt: string, dojo: string }[]

    const [loading, setLoading] = useState<string | null>(null)

    const handleSelect = async (studentId: string) => {
        setLoading(studentId)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const { error } = await supabase
            .from('students')
            .update({ parent_id: user.id })
            .eq('id', studentId)

        if (error) {
            alert('Error linking ninja: ' + error.message)
            setLoading(null)
            return
        }

        router.push('/info')
    }

    const handleCreateNew = async () => {
        setLoading('new')
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // Get location from profile to match
        const { data: profile } = await supabase.from('profiles').select('assigned_dojo').eq('id', user.id).single()

        const { error } = await supabase
            .from('students')
            .insert({
                name: childName,
                parent_id: user.id,
                belt_color: 'white',
                assigned_dojo: profile?.assigned_dojo
            })

        if (error) {
            alert('Error creating new ninja: ' + error.message)
            setLoading(null)
            return
        }

        router.push('/info')
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-500 to-blue-700">
            <div className="bg-white rounded-[32px] p-8 shadow-2xl max-w-lg w-full space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <LucideUserCheck className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Multiple <span className="text-blue-600">{childName}s</span> Found!
                    </h1>
                    <p className="text-slate-500 font-medium">
                        We found a few ninjas with that name. Which one is yours?
                    </p>
                </div>

                <div className="space-y-3">
                    {matches.map((match) => (
                        <button
                            key={match.id}
                            onClick={() => handleSelect(match.id)}
                            disabled={!!loading}
                            className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group disabled:opacity-50"
                        >
                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase font-bold text-xs ring-4 ring-transparent group-hover:ring-blue-100">
                                {match.belt}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-900">{childName}</div>
                                <div className="text-sm text-slate-500 font-medium">{match.dojo} Dojo</div>
                            </div>
                            <LucideCheck className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-400">
                            <span className="bg-white px-4">OR</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateNew}
                        disabled={!!loading}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 transition-all text-left group disabled:opacity-50"
                    >
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <LucideUserPlus className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-900">None of these</div>
                            <div className="text-sm text-slate-400 font-medium">Create a new ninja profile</div>
                        </div>
                    </button>
                </div>

                <p className="text-center text-slate-400 text-sm font-medium">
                    This helps us make sure we link the right progress to your account.
                </p>
            </div>
        </div>
    )
}

export default function SelectNinjaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-blue-600 flex items-center justify-center text-white font-bold">Loading...</div>}>
            <SelectNinjaContent />
        </Suspense>
    )
}
