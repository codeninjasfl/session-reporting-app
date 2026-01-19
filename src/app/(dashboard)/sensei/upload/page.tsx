'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LucideArrowLeft, LucideUserPlus, LucideUpload } from 'lucide-react'
import { addStudent, bulkUploadStudents } from './actions'

export default function UploadPage() {
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [csvText, setCsvText] = useState('')

    async function handleAddStudent(formData: FormData) {
        setMessage(null)
        const result = await addStudent(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Student added successfully!' })
            // Clear form
            const form = document.getElementById('add-student-form') as HTMLFormElement
            form?.reset()
        }
    }

    async function handleBulkUpload() {
        setMessage(null)
        const formData = new FormData()
        formData.set('csvData', csvText)

        const result = await bulkUploadStudents(formData)
        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: `Successfully added ${result.count} students!` })
            setCsvText('')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4 animate-in slide-in-up delay-100">
                <Link href="/sensei" className="text-[var(--brand)] hover:underline flex items-center">
                    <LucideArrowLeft className="h-4 w-4 mr-1" />
                    Back to Students
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-[var(--foreground)] uppercase animate-in slide-in-up delay-100">
                Add Ninjas
            </h1>

            {message && (
                <div className={`p-4 rounded-lg animate-in fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Manual Add */}
                <div className="cn-card p-6 bg-white animate-in slide-in-up delay-150">
                    <div className="flex items-center gap-2 mb-4">
                        <LucideUserPlus className="h-6 w-6 text-[var(--brand)]" />
                        <h2 className="text-xl font-bold text-[var(--foreground)] uppercase">Add Single Student</h2>
                    </div>

                    <form id="add-student-form" action={handleAddStudent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Enter ninja name"
                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Belt Color</label>
                            <select
                                name="belt_color"
                                className="w-full rounded-md border border-gray-300 p-2 bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                            >
                                <option value="white">White Belt</option>
                                <option value="yellow">Yellow Belt</option>
                                <option value="orange">Orange Belt</option>
                                <option value="green">Green Belt</option>
                                <option value="blue">Blue Belt</option>
                                <option value="purple">Purple Belt</option>
                                <option value="brown">Brown Belt</option>
                                <option value="red">Red Belt</option>
                                <option value="black">Black Belt</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-5 py-3 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Add Student
                        </button>
                    </form>
                </div>

                {/* Bulk CSV Upload */}
                <div className="cn-card p-6 bg-white animate-in slide-in-up delay-200">
                    <div className="flex items-center gap-2 mb-4">
                        <LucideUpload className="h-6 w-6 text-[var(--brand)]" />
                        <h2 className="text-xl font-bold text-[var(--foreground)] uppercase">Bulk CSV Upload</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Paste CSV data below. Format: <code className="bg-gray-100 px-1 rounded">name,belt_color</code> (one per line)
                        </p>

                        <textarea
                            value={csvText}
                            onChange={(e) => setCsvText(e.target.value)}
                            placeholder={`Example:\nJohn Doe,white\nJane Smith,yellow\nBob Johnson,orange`}
                            rows={8}
                            className="w-full rounded-md border border-gray-300 p-2 font-mono text-sm focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                        />

                        <button
                            type="button"
                            onClick={handleBulkUpload}
                            disabled={!csvText.trim()}
                            className="w-full px-5 py-3 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Upload Students
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
