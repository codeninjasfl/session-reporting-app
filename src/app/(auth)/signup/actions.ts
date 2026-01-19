'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const location = formData.get('location') as string
    const childCount = parseInt(formData.get('childCount') as string) || 1

    // Collect all child names and any pre-selected student IDs
    const children: { name: string; studentId?: string }[] = []
    for (let i = 0; i < childCount; i++) {
        const name = formData.get(`childName${i}`) as string
        const studentId = formData.get(`childStudentId${i}`) as string | null
        if (name && name.trim()) {
            children.push({
                name: name.trim(),
                studentId: studentId || undefined
            })
        }
    }

    if (children.length === 0) {
        return { error: 'Please enter at least one child\'s name.' }
    }

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                assigned_dojo: location
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Something went wrong. Please try again.' }
    }

    // Use admin client for operations that need to bypass RLS
    const adminSupabase = createAdminClient()

    // 2. Create/Update the Profile with location (bypasses RLS)
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: 'parent',
            assigned_dojo: location
        })

    if (profileError) {
        console.error('[SIGNUP] Profile creation error:', profileError)
        return { error: `Failed to create profile: ${profileError.message}` }
    }

    // 3. Handle Child Linking/Creation for each child
    const linkedChildren: string[] = []
    const createdChildren: string[] = []
    const errors: string[] = []

    for (const child of children) {
        // If a studentId was pre-selected from the dropdown, link directly
        if (child.studentId) {
            const { error: linkError } = await adminSupabase
                .from('students')
                .update({
                    parent_id: authData.user.id,
                    assigned_dojo: location
                })
                .eq('id', child.studentId)
                .is('parent_id', null) // Safety check: only if still unassigned

            if (linkError) {
                console.error(`[SIGNUP] Link student error for ${child.name}:`, linkError)
                errors.push(`Failed to link ${child.name}`)
            } else {
                linkedChildren.push(child.name)
                console.log(`[SIGNUP] Linked pre-selected student: ${child.name} (${child.studentId})`)
            }
            continue
        }

        // Otherwise, search for existing students by name
        const { data: matches, error: searchError } = await adminSupabase
            .from('students')
            .select('id, name, parent_id, belt_color, assigned_dojo')
            .ilike('name', child.name)

        if (searchError) {
            console.error(`[SIGNUP] Student search error for ${child.name}:`, searchError)
        }

        // Filter for students who DON'T have a parent yet
        const unassignedMatches = matches?.filter(s => !s.parent_id) || []

        if (unassignedMatches.length === 1) {
            // Exactly one unassigned match - link it
            const studentToLink = unassignedMatches[0]
            const { error: linkError } = await adminSupabase
                .from('students')
                .update({
                    parent_id: authData.user.id,
                    assigned_dojo: location
                })
                .eq('id', studentToLink.id)

            if (linkError) {
                console.error(`[SIGNUP] Link student error for ${child.name}:`, linkError)
                errors.push(`Failed to link ${child.name}`)
            } else {
                linkedChildren.push(child.name)
                console.log(`[SIGNUP] Linked existing student: ${child.name}`)
            }
        } else {
            // No matches or multiple matches - create new student
            const { error: createError } = await adminSupabase
                .from('students')
                .insert({
                    name: child.name,
                    parent_id: authData.user.id,
                    belt_color: 'white',
                    assigned_dojo: location
                })

            if (createError) {
                console.error(`[SIGNUP] Create student error for ${child.name}:`, createError)
                errors.push(`Failed to add ${child.name}`)
            } else {
                createdChildren.push(child.name)
                console.log(`[SIGNUP] Created new student: ${child.name}`)
            }
        }
    }

    // Log summary
    console.log(`[SIGNUP] Complete. Linked: ${linkedChildren.length}, Created: ${createdChildren.length}, Errors: ${errors.length}`)

    if (errors.length > 0 && linkedChildren.length === 0 && createdChildren.length === 0) {
        return { error: `Account created, but failed to add children: ${errors.join(', ')}` }
    }

    revalidatePath('/', 'layout')
    redirect('/info')
}
