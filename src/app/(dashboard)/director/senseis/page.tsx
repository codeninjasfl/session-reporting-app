
import { createClient } from '@/utils/supabase/server'
import { LucideShield, LucideUsers, LucideTrash2 } from 'lucide-react'

export default async function ManageSenseisPage() {
    const supabase = await createClient()

    // Get current user (director) and their assigned dojo
    const { data: { user } } = await supabase.auth.getUser()
    const { data: directorProfile } = await supabase
        .from('profiles')
        .select('assigned_dojo')
        .eq('id', user?.id)
        .single()

    const directorDojo = directorProfile?.assigned_dojo

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

    if (error) {
        console.error(error)
        return <div>Error loading users</div>
    }

    // Filter senseis by director's dojo (if director has one assigned)
    const senseis = (profiles?.filter(p => p.role === 'sensei') || [])
        .filter(s => !directorDojo || s.assigned_dojo === directorDojo)

    // Filter parents by director's dojo too
    const others = (profiles?.filter(p => p.role === 'parent') || [])
        .filter(p => !directorDojo || p.assigned_dojo === directorDojo)

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-3xl font-bold uppercase">
                    Manage Users
                </h1>
                <p>
                    {directorDojo ? `Managing ${directorDojo} location` : 'View and manage user accounts'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Senseis */}
                <div className="space-y-4 animate-in slide-in-up delay-150">
                    <h2 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                        <LucideShield className="h-5 w-5" />
                        Current Senseis
                    </h2>
                    <div className="grid gap-4">
                        {senseis.map((sensei, index) => (
                            <div
                                key={sensei.id}
                                className="cn-card p-4 flex items-center justify-between border-l-4 border-green-500 animate-in slide-in-up"
                                style={{ animationDelay: `${200 + index * 50}ms` }}
                            >
                                <div>
                                    <h3 className="font-bold text-[var(--ink)]">{sensei.full_name}</h3>
                                    <p className="text-xs text-gray-500">{sensei.email}</p>
                                    <p className="text-xs font-semibold text-green-600 uppercase mt-1">{sensei.assigned_dojo || 'Global'}</p>
                                </div>
                                {/* In a real app, add actions here */}
                            </div>
                        ))}
                        {senseis.length === 0 && (
                            <p className="text-white/70 italic p-4 cn-card">No senseis assigned yet.</p>
                        )}
                    </div>
                </div>

                {/* Other Users (Potential Senseis) */}
                <div className="space-y-4 animate-in slide-in-up delay-200">
                    <h2 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                        <LucideUsers className="h-5 w-5" />
                        Parent Accounts
                    </h2>
                    <div className="grid gap-4">
                        {others.map((profile, index) => (
                            <div
                                key={profile.id}
                                className="cn-card p-4 flex items-center justify-between animate-in slide-in-up"
                                style={{ animationDelay: `${250 + index * 50}ms` }}
                            >
                                <div>
                                    <h3 className="font-bold text-[var(--ink)]">{profile.full_name}</h3>
                                    <p className="text-xs text-gray-500">{profile.email}</p>
                                </div>
                                <span className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-full">
                                    Parent Role
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

