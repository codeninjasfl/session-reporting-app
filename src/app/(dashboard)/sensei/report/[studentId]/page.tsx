
import { createClient } from '@/utils/supabase/server'
import { submitSessionCard } from '../actions'
import { LucideWrench, LucideTrophy, LucideGlobe } from 'lucide-react'
import Link from 'next/link'
import VisualEditorClient from './VisualEditorClient'

// Mock Curriculum Data matching the reference image concept
const CURRICULUM_LEVELS = [
    { level: 1, title: 'Introduction to coding with blocks, creating sprites' },
    { level: 2, title: 'Sequencing code, creating dialog boxes' },
    { level: 3, title: 'Using events, sprite movement' },
    { level: 4, title: 'Using functions with parameters, sprite overlap events' },
    { level: 5, title: 'Using variables (score, life, countdown timer)' },
    { level: 6, title: 'Game update loops, projectiles, button pressed events' },
    { level: 7, title: 'Using conditionals and equality operators' },
    { level: 8, title: 'Adding music and animation' },
]

export default async function ReportPage({
    params,
    searchParams
}: {
    params: Promise<{ studentId: string }>
    searchParams: Promise<{ mode?: string }>
}) {
    const supabase = await createClient()
    const { studentId } = await params
    const { mode = 'visual' } = await searchParams

    const { data: student } = await supabase
        .from('students')
        .select('*, parent:profiles(full_name)')
        .eq('id', studentId)
        .single()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: sensei } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single()

    if (!student) return <div className="text-white p-8">Student not found. Please go back and try again.</div>


    return (
        <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-2xl font-bold uppercase">Session Card for {student.name}</h1>
                <p className="text-white/70">{student.belt_color} Belt</p>
            </div>

            <VisualEditorClient
                student={{ id: student.id, name: student.name, belt_color: student.belt_color }}
                senseiName={sensei?.full_name || 'Sensei'}
            />
        </div>
    )
}
