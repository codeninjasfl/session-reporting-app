'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SessionCardEditor from '@/components/SessionCardEditor'
import { createClient } from '@/utils/supabase/client'

interface VisualEditorClientProps {
    student: {
        id: string
        name: string
        belt_color: string
    }
    senseiName: string
}

export default function VisualEditorClient({ student, senseiName }: VisualEditorClientProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async (imageDataUrl: string) => {
        setSaving(true)
        setError(null)

        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Convert data URL to blob
            const response = await fetch(imageDataUrl)
            const blob = await response.blob()

            // Generate unique filename
            const filename = `session-card-${student.id}-${Date.now()}.png`

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('session-cards')
                .upload(filename, blob, {
                    contentType: 'image/png',
                    cacheControl: '3600'
                })

            if (uploadError) {
                // If bucket doesn't exist, we'll store the data URL directly
                console.warn('Storage upload failed, using data URL:', uploadError)
            }

            // Get public URL or use data URL as fallback
            let cardImageUrl = imageDataUrl
            if (uploadData) {
                const { data: urlData } = supabase.storage
                    .from('session-cards')
                    .getPublicUrl(filename)
                cardImageUrl = urlData.publicUrl
            }

            // Create session card record
            const { error: insertError } = await supabase
                .from('session_cards')
                .insert({
                    student_id: student.id,
                    sensei_id: user.id,
                    date: new Date().toISOString(),
                    activities_completed: ['Visual Session Card'],
                    notes: 'Visual session card submitted',
                    next_goals: '',
                    card_image_url: cardImageUrl
                })

            if (insertError) throw insertError

            // Redirect back to students list
            router.push('/sensei')
            router.refresh()

        } catch (err: any) {
            console.error('Save error:', err)
            setError(err.message || 'Failed to save session card')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in">
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-2xl font-bold uppercase">Visual Session Card</h1>
                <p>Fill out the card for {student.name}</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {saving && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                    Saving session card...
                </div>
            )}

            <SessionCardEditor
                beltColor={student.belt_color}
                studentName={student.name}
                senseiName={senseiName}
                onSave={handleSave}
            />
        </div>
    )
}
