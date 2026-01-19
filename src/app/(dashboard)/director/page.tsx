'use client'

import { useEffect, useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import { createNews } from './actions'
import { createClient } from '@/utils/supabase/client'

export default function DirectorPage() {
    const [userDojo, setUserDojo] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserDojo = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('assigned_dojo, role')
                    .eq('id', user.id)
                    .single()

                setUserDojo(profile?.assigned_dojo || null)
                setUserRole(profile?.role || null)
            }
            setLoading(false)
        }
        fetchUserDojo()
    }, [])

    const handleSubmit = async (title: string, content: string, targetDojo: string) => {
        await createNews(title, content, targetDojo)
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
                <div className="dashboard-header">
                    <h1 className="text-3xl font-bold uppercase">Director Dashboard</h1>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-3xl font-bold uppercase">
                    Director Dashboard
                </h1>
                <p>Post announcements to parents and ninjas</p>
            </div>

            <RichTextEditor
                onSubmit={handleSubmit}
                lockedDojo={userDojo}
                canSelectDojo={userRole === 'franchise_owner'}
            />
        </div>
    )
}
