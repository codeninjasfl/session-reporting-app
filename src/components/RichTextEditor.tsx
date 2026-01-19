'use client'

import { useState, useRef, useEffect } from 'react'
import { LucideBold, LucideItalic, LucideLink, LucideImage, LucideList, LucideEye, LucideSend, LucideX, LucideLoader2 } from 'lucide-react'
import MarkdownContent from './MarkdownContent'
import { createClient } from '@/utils/supabase/client'

type RichTextEditorProps = {
    onSubmit: (title: string, content: string, targetDojo: string) => Promise<void>
    lockedDojo?: string | null
    canSelectDojo?: boolean
}

export default function RichTextEditor({ onSubmit, lockedDojo, canSelectDojo = false }: RichTextEditorProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

    // Initialize targetDojo with lockedDojo if available, otherwise 'Global'
    const [targetDojo, setTargetDojo] = useState(lockedDojo || 'Global')
    const [showPreview, setShowPreview] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Update targetDojo if lockedDojo changes (e.g. after loading)
    useEffect(() => {
        if (lockedDojo) {
            setTargetDojo(lockedDojo)
        }
    }, [lockedDojo])

    const insertFormatting = (before: string, after: string = before, placeholder: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = content.substring(start, end) || placeholder

        const newContent =
            content.substring(0, start) +
            before + selectedText + after +
            content.substring(end)

        setContent(newContent)

        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + before.length + selectedText.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    const handleBold = () => insertFormatting('**', '**', 'bold text')
    const handleItalic = () => insertFormatting('*', '*', 'italic text')
    const handleLink = () => {
        const url = prompt('Enter URL:')
        if (url) insertFormatting('[', `](${url})`, 'link text')
    }

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be less than 10MB')
            return
        }

        setIsUploading(true)

        try {
            const supabase = createClient()

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `news-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('news-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error('Upload error:', error)
                alert('Failed to upload image. Please try again.')
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('news-images')
                .getPublicUrl(fileName)

            // Insert into content
            setContent(prev => prev + `\n![Image](${publicUrl})\n`)
            // Auto switch to preview to show the image? Maybe not, forcing user might be annoying.

        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload image. Please try again.')
        } finally {
            setIsUploading(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleList = () => insertFormatting('\n- ', '', 'list item')

    const handlePreview = () => {
        if (!title.trim() || !content.trim()) {
            alert('Please enter a title and content')
            return
        }
        setShowPreview(true)
    }

    const handleConfirmPost = async () => {
        setIsSubmitting(true)
        try {
            await onSubmit(title, content, targetDojo)
            setTitle('')
            setContent('')
            // Reset to locked dojo if exists, else Global
            setTargetDojo(lockedDojo || 'Global')
            setShowPreview(false)
            setActiveTab('write')
        } catch (error) {
            alert('Failed to post. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="cn-card p-6 h-fit animate-in slide-in-up delay-150">
                <h2 className="text-xl font-bold mb-4 uppercase text-[var(--brand)]">Post Announcement</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[var(--brand)] focus:ring-[var(--brand)] border p-3 transition-all duration-300 focus:shadow-lg"
                            placeholder="Announcement title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>

                        {/* Tabbed Editor Container */}
                        <div className="flex flex-col border border-gray-300 rounded-xl overflow-hidden shadow-sm transition-all duration-300 focus-within:ring-1 focus-within:ring-[var(--brand)] focus-within:border-[var(--brand)]">

                            {/* Tabs & Toolbar */}
                            <div className="flex flex-col bg-gray-50 border-b border-gray-200">
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('write')}
                                        className={`px-4 py-2 text-sm font-medium transition-colors border-r border-gray-200 ${activeTab === 'write' ? 'bg-white text-[var(--brand)] border-b-0' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('preview')}
                                        className={`px-4 py-2 text-sm font-medium transition-colors border-r border-gray-200 ${activeTab === 'preview' ? 'bg-white text-[var(--brand)] border-b-0' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Preview
                                    </button>
                                </div>

                                {/* Toolbar (Only visible in Write mode) */}
                                {activeTab === 'write' && (
                                    <div className="flex gap-1 p-2 bg-white border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleBold}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                            title="Bold"
                                        >
                                            <LucideBold className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleItalic}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                            title="Italic"
                                        >
                                            <LucideItalic className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleLink}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                            title="Insert Link"
                                        >
                                            <LucideLink className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleImageClick}
                                            disabled={isUploading}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                                            title="Upload Image"
                                        >
                                            {isUploading ? (
                                                <LucideLoader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <LucideImage className="h-4 w-4" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleList}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                            title="Bullet List"
                                        >
                                            <LucideList className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className={`block w-full transition-all duration-300 min-h-[300px] ${activeTab === 'preview' ? 'bg-gray-50' : 'bg-white'}`}>
                                {activeTab === 'write' ? (
                                    <>
                                        {/* Hidden file input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <textarea
                                            ref={textareaRef}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={12}
                                            placeholder="Write your announcement here..."
                                            className="w-full p-4 bg-transparent border-none focus:ring-0 resize-y min-h-[300px] outline-none"
                                        />
                                    </>
                                ) : (
                                    <div className="p-4 prose prose-sm max-w-none overflow-y-auto">
                                        {content ? (
                                            <MarkdownContent content={content} />
                                        ) : (
                                            <p className="text-gray-400 italic">Nothing to preview yet...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Target Dojo Selection - Only visible if canSelectDojo is true */}
                    {canSelectDojo && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Dojo</label>
                            <select
                                value={targetDojo}
                                onChange={(e) => setTargetDojo(e.target.value)}
                                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[var(--brand)] focus:ring-[var(--brand)] border p-3 bg-white transition-all duration-300 focus:shadow-lg"
                            >
                                <option value="Global">All Dojos</option>
                                <option value="Cooper City">Cooper City</option>
                                <option value="Weston">Weston</option>
                                <option value="Aventura">Aventura</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand)] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        <LucideEye className="h-5 w-5" />
                        Preview & Post
                    </button>
                </div>
            </div>

            {/* Full Screen Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[var(--brand)]">Confirm Post</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <LucideX className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="cn-card p-6 border-l-4 border-[var(--brand)]">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-[var(--ink)]">{title}</h3>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-[var(--brand)] uppercase mb-3">
                                    Target: {targetDojo}
                                </p>
                                <MarkdownContent content={content} />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={handleConfirmPost}
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--brand)] text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                <LucideSend className="h-5 w-5" />
                                {isSubmitting ? 'Posting...' : 'Confirm & Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
