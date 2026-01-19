import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LucideArrowLeft, LucideUpload } from 'lucide-react'
import UploadForm from './UploadForm'

export default async function UploadProjectPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'parent'
    const isStaff = ['sensei', 'director', 'franchise_owner', 'admin'].includes(role)

    // Redirect if not staff
    if (!isStaff) {
        redirect('/gallery')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
            <div className="flex items-center gap-4 animate-in slide-in-up delay-100">
                <Link href="/gallery" className="text-white/70 hover:text-white flex items-center gap-2 font-semibold transition-colors">
                    <LucideArrowLeft className="h-5 w-5" />
                    Back to Gallery
                </Link>
            </div>

            <div className="animate-in slide-in-up delay-150">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <LucideUpload className="h-7 w-7 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm">Upload Project</h1>
                </div>
                <p className="text-white/80 text-lg font-medium">Share an IMPACT MakeCode Arcade game with the Dojo!</p>
            </div>

            <div className="animate-in slide-in-up delay-200">
                <UploadForm />
            </div>
        </div>
    )
}
