'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Belt, Location } from '@/lib/gallery-types'

export async function createProject(formData: {
    creator_name: string
    location: Location
    belt: Belt
    title: string
    description: string
    png_path: string
    makecode_url: string
}) {
    const supabase = await createClient()

    // Verify user role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'parent'
    const isStaff = ['sensei', 'director', 'franchise_owner', 'admin'].includes(role)

    if (!isStaff) {
        return { error: 'Unauthorized: Only Senseis and higher can add games.' }
    }

    // Insert project record
    const { data, error } = await supabase
        .from('projects')
        .insert({
            creator_name: formData.creator_name,
            location: formData.location,
            belt: formData.belt,
            title: formData.title,
            description: formData.description,
            png_path: formData.png_path,
            status: 'ready',
            makecode_url: formData.makecode_url,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating project:', error)
        return { error: 'Failed to create project record' }
    }

    revalidatePath('/gallery')
    return { success: true, project: data }
}
