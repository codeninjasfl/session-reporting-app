'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitSessionCard(formData: FormData) {
    const supabase = await createClient()

    const studentId = formData.get('student_id') as string
    const notes = formData.get('notes') as string
    const nextGoals = formData.get('next_goals') as string
    const activities = formData.getAll('activities') as string[] // Checkboxes

    const { data: { user } } = await supabase.auth.getUser()

    // Create Session Card
    const { error } = await supabase
        .from('session_cards')
        .insert({
            student_id: studentId,
            sensei_id: user?.id,
            date: new Date().toISOString(),
            activities_completed: activities,
            notes: notes,
            next_goals: nextGoals,
        })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/sensei')
    redirect('/sensei')
}
