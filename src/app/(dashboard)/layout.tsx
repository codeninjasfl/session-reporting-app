import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import { cookies } from 'next/headers'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch role and profile info
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'parent'

    const userProfile = {
        full_name: profile?.full_name || user.user_metadata?.full_name || null,
        email: profile?.email || user.email || null,
        initial: (profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%)' }}>
            <DashboardSidebar role={role} user={userProfile} />
            <main className="flex-1 overflow-y-auto p-8" style={{ willChange: 'scroll-position', transform: 'translateZ(0)' }}>
                {children}
            </main>
        </div>
    )
}
