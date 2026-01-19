'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNews(title: string, content: string, targetDojo: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('news')
        .insert({
            author_id: user?.id,
            title,
            content,
            target_dojo: targetDojo === 'Global' ? null : targetDojo,
        })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/director')
    revalidatePath('/news')
    revalidatePath('/info')
}
