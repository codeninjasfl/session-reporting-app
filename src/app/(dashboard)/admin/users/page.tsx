
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminUserTable from './AdminUserTable'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // 1. Verify Role - Only Franchise Owner and Director
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, assigned_dojo')
        .eq('id', user.id)
        .single()

    const isOwner = profile?.role === 'franchise_owner'
    const isDirector = profile?.role === 'director'

    if (!isOwner && !isDirector) {
        redirect('/director')
    }

    // 2. Fetch Profiles
    let query = supabase.from('profiles').select('*')

    // Directors only see Parents in their Dojo
    if (isDirector) {
        query = query.eq('role', 'parent').eq('assigned_dojo', profile.assigned_dojo)
    }

    const { data: profiles, error: pError } = await query.order('created_at', { ascending: false })

    if (pError) {
        console.error('Admin Fetch Error (Profiles):', pError.message)
    }

    // 3. Fetch all students (to allow linking)
    let studentQuery = supabase.from('students').select('id, name, belt_color, parent_id, assigned_dojo')

    // If Director, only fetch students in their dojo OR unassigned students
    if (isDirector) {
        studentQuery = studentQuery.or(`assigned_dojo.eq."${profile.assigned_dojo}",assigned_dojo.is.null`)
    }

    const { data: allStudents, error: sError } = await studentQuery

    if (sError) {
        console.error('Admin Fetch Error (Students):', sError.message)
    }

    // Map students to their profile parents
    const profilesWithStudents = profiles?.map(p => ({
        ...p,
        students: allStudents?.filter(s => s.parent_id === p.id) || []
    })) || []

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-3xl font-bold uppercase">
                    {isOwner ? 'System User Management' : 'Parent Management'}
                </h1>
                <p>
                    {isOwner
                        ? 'Manage Senseis, Directors, and Parents across all dojos.'
                        : 'View parents and link them to their children.'}
                </p>
            </div>

            <div className="cn-card p-6 animate-in slide-in-up delay-150">
                <AdminUserTable
                    initialProfiles={profilesWithStudents}
                    currentUserRole={profile?.role as any}
                />
            </div>
        </div>
    )
}
