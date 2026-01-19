'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Belt, Location, BELT_OPTIONS, LOCATION_OPTIONS } from '@/lib/gallery-types'
import { createProject } from './actions'
import { LucideUpload, LucideCheck, LucideLoader2, LucideXCircle } from 'lucide-react'

export default function UploadForm() {
    const router = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)

    const [creatorName, setCreatorName] = useState('')
    const [location, setLocation] = useState<Location>('Aventura')
    const [belt, setBelt] = useState<Belt>('white')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    function handleFileSelect(selectedFile: File) {
        if (!selectedFile.type.startsWith('image/png')) {
            setError('Please upload a PNG image')
            return
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File too large. Maximum size is 10MB.')
            return
        }

        setFile(selectedFile)
        setError(null)

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!file || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            // 1. Upload to Storage
            const timestamp = Date.now()
            const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

            const { error: uploadError } = await supabase.storage
                .from('project_pngs')
                .upload(filename, file, { cacheControl: '3600', upsert: false })

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project_pngs')
                .getPublicUrl(filename)

            // 3. Create MakeCode URL
            const makecodeUrl = `https://arcade.makecode.com/?importurl=${encodeURIComponent(publicUrl)}`

            // 4. Create DB Record via Server Action
            const result = await createProject({
                creator_name: creatorName.trim(),
                location,
                belt,
                title: title.trim(),
                description: description.trim(),
                png_path: filename,
                makecode_url: makecodeUrl
            })

            if (result.error) throw new Error(result.error)

            setSuccess(true)
            setTimeout(() => router.push('/gallery'), 2000)

        } catch (err: any) {
            setError(err.message)
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="cn-card p-12 text-center space-y-4 animate-in zoom-in">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LucideCheck className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase">Project Uploaded!</h2>
                <p className="text-gray-600 text-lg">Redirecting you to the gallery...</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-white/70 uppercase tracking-wider">Project Screenshot (PNG)</label>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 gap-3 overflow-hidden ${dragOver ? 'border-white bg-white/20' : 'border-white/20 bg-white/10 hover:bg-white/15'
                            }`}
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                <div className="relative z-10 flex flex-col items-center gap-2 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                    <LucideCheck className="h-8 w-8 text-green-400" />
                                    <span className="text-sm font-bold text-white truncate max-w-[200px]">{file?.name}</span>
                                    <span className="text-[10px] uppercase text-white/60">Click to change</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <LucideUpload className="h-10 w-10 text-white/40" />
                                <div className="text-center">
                                    <p className="text-white font-bold">Drop your screenshot here</p>
                                    <p className="text-white/40 text-xs">PNG only (Max 10MB)</p>
                                </div>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-white/50 italic">
                        Tip: In IMPACT/MakeCode Arcade, use the screenshot button to get a PNG that contains your code!
                    </p>
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                    <div className="cn-card p-6 bg-white/95 backdrop-blur-md space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ninja Name</label>
                            <input
                                type="text"
                                required
                                value={creatorName}
                                onChange={(e) => setCreatorName(e.target.value)}
                                placeholder="e.g. Ninja John"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Location</label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value as Location)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white text-gray-900"
                                >
                                    {LOCATION_OPTIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Belt Level</label>
                                <select
                                    value={belt}
                                    onChange={(e) => setBelt(e.target.value as Belt)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium bg-white capitalize text-gray-900"
                                >
                                    {BELT_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Project Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Super Platformer Deluxe"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-black text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's your game about? (Optional)"
                                rows={3}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm animate-in shake">
                            <LucideXCircle className="h-5 w-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || isSubmitting}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${!file || isSubmitting
                                ? 'bg-white/10 text-white/20 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white hover:-translate-y-1 active:scale-95 shadow-green-500/20'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <LucideLoader2 className="h-6 w-6 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <LucideUpload className="h-6 w-6" />
                                Publish to Gallery
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
