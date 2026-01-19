'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(userId: string, updates: { role?: string, assigned_dojo?: string | null }) {
    const supabase = await createClient()

    // 1. Verify Role (Using standard client to check authorization)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (adminProfile?.role !== 'franchise_owner') {
        throw new Error('Unauthorized: Only Franchise Owners can modify roles.')
    }

    // 2. Perform Update (Using Admin Client to bypass RLS)
    const admin = createAdminClient()
    const { error } = await admin
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (error) {
        console.error('Admin Update Profile Error:', error)
        throw new Error(error.message)
    }
    revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
    const supabase = await createClient()

    // 1. Verify Role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (adminProfile?.role !== 'franchise_owner') {
        throw new Error('Unauthorized')
    }

    // 2. Perform Delete (Using Admin Client to bypass RLS)
    const admin = createAdminClient()
    const { error } = await admin
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (error) {
        console.error('Admin Delete User Error:', error)
        throw new Error(error.message)
    }
    revalidatePath('/admin/users')
}

// === NEW: Student Linking ===

export async function searchStudents(query: string) {
    const supabase = await createClient()

    if (query.length < 2) return []

    const { data: students } = await supabase
        .from('students')
        .select('id, name, belt_color, assigned_dojo')
        .ilike('name', `%${query}%`)
        .limit(10)

    return students || []
}

export async function linkStudentToParent(studentId: string, parentId: string) {
    const supabase = await createClient()

    // Authorization Check (Franchise Owner)
    // Directors might need this too later, but for now assuming Owner page
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (!['franchise_owner', 'director', 'sensei'].includes(adminProfile?.role || '')) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('students')
        .update({ parent_id: parentId })
        .eq('id', studentId)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/users')
}

export async function unlinkStudent(studentId: string) {
    const supabase = await createClient()
    // Authorization Check
    const { data: { user } } = await supabase.auth.getUser()
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (!['franchise_owner', 'director', 'sensei'].includes(adminProfile?.role || '')) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('students')
        .update({ parent_id: null })
        .eq('id', studentId)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/users')
}
