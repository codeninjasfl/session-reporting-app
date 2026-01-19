import { LucideImage, LucidePlus } from 'lucide-react'
import Link from 'next/link'
import GalleryPageClient from '@/components/gallery/GalleryPageClient'
import { createClient } from '@/utils/supabase/server'

export default async function GalleryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    const role = profile?.role || 'parent'
    const isStaff = ['sensei', 'director', 'franchise_owner', 'admin'].includes(role)

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-12">
            {/* Page Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-up delay-75">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <LucideImage className="h-7 w-7 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm">Project Gallery</h1>
                    </div>
                    <p className="text-white/80 text-lg font-medium">Discover amazing games built by ninjas like you!</p>
                </div>

                {isStaff && (
                    <Link
                        href="/gallery/upload"
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/20 active:scale-95"
                    >
                        <LucidePlus className="h-5 w-5" />
                        Upload Project
                    </Link>
                )}
            </div>

            {/* Gallery Content */}
            <div className="animate-in slide-in-up delay-150">
                <GalleryPageClient />
            </div>
        </div>
    )
}
