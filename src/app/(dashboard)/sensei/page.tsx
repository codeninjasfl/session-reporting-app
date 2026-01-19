
import { createClient } from '@/utils/supabase/server'
import StudentsList from '@/components/StudentsList'

export const revalidate = 60 // Cache student list for 1 minute

export default async function SenseiPage() {
    const supabase = await createClient()

    // Get current sensei's dojo
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_dojo')
        .eq('id', user?.id)
        .single()

    const senseiDojo = profile?.assigned_dojo

    // Fetch students filtered by student's assigned_dojo
    let query = supabase
        .from('students')
        .select('id, name, belt_color, parent:profiles(full_name)')
        .order('name')

    // Filter by sensei's dojo if they have one assigned
    if (senseiDojo) {
        query = query.eq('assigned_dojo', senseiDojo)
    }

    const { data: students } = await query

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-3xl font-bold uppercase">My Ninjas</h1>
                <p>Select a ninja to create a session card</p>
            </div>

            <StudentsList students={students || []} />
        </div>
    )
}
