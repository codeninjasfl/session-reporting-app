'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addStudent(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const belt_color = formData.get('belt_color') as string || 'white'

    if (!name || name.trim() === '') {
        return { error: 'Student name is required' }
    }

    // Get sensei's assigned dojo
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_dojo')
        .eq('id', user?.id)
        .single()

    const { error } = await supabase
        .from('students')
        .insert({
            name: name.trim(),
            belt_color,
            assigned_dojo: profile?.assigned_dojo || null,
        })

    if (error) {
        console.error('Add student error:', error)
        return { error: 'Failed to add student' }
    }

    revalidatePath('/sensei')
    return { success: true }
}

export async function bulkUploadStudents(formData: FormData) {
    const supabase = await createClient()

    const csvData = formData.get('csvData') as string

    if (!csvData || csvData.trim() === '') {
        return { error: 'No CSV data provided' }
    }

    // Get sensei's assigned dojo
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_dojo')
        .eq('id', user?.id)
        .single()

    const senseiDojo = profile?.assigned_dojo || null

    // Parse CSV: Expected format: name,belt_color (one per line)
    const lines = csvData.trim().split('\n')
    const students: { name: string; belt_color: string; assigned_dojo: string | null }[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Skip header row if present
        if (i === 0 && line.toLowerCase().includes('name')) continue

        const parts = line.split(',')
        const name = parts[0]?.trim()
        const belt_color = parts[1]?.trim() || 'white'

        if (name) {
            students.push({ name, belt_color, assigned_dojo: senseiDojo })
        }
    }

    if (students.length === 0) {
        return { error: 'No valid students found in CSV' }
    }

    const { error } = await supabase
        .from('students')
        .insert(students)

    if (error) {
        console.error('Bulk upload error:', error)
        return { error: 'Failed to upload students' }
    }

    revalidatePath('/sensei')
    return { success: true, count: students.length }
}
