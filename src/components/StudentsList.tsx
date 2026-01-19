'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LucideFileText, LucideSearch } from 'lucide-react'

interface Student {
    id: string
    name: string
    belt_color: string
    parent?: {
        full_name: string
    } | { full_name: string }[] | null
}

interface StudentsListProps {
    students: Student[]
}

// Helper to get parent name from potentially array or object
const getParentName = (parent: Student['parent']): string => {
    if (!parent) return 'No parent linked'
    if (Array.isArray(parent)) return parent[0]?.full_name || 'No parent linked'
    return parent.full_name || 'No parent linked'
}


export default function StudentsList({ students }: StudentsListProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students
        const query = searchQuery.toLowerCase()
        return students.filter(s =>
            s.name.toLowerCase().includes(query) ||
            getParentName(s.parent).toLowerCase().includes(query)
        )
    }, [students, searchQuery])

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ninjas by name..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-all"
                />
            </div>

            {/* Students Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => (
                    <div
                        key={student.id}
                        className="cn-card flex flex-col justify-between p-5 hover:border-blue-300 transition-all"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[var(--ink)]">
                                    {student.name}
                                </h3>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase border ${student.belt_color === 'white' ? 'bg-white text-gray-800 border-gray-300' :
                                    student.belt_color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                        student.belt_color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                            student.belt_color === 'green' ? 'bg-green-100 text-green-800 border-green-300' :
                                                'bg-gray-100 text-gray-800 border-gray-300'
                                    }`}>
                                    {student.belt_color}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                {getParentName(student.parent)}
                            </p>
                        </div>

                        <Link
                            href={`/sensei/report/${student.id}`}
                            prefetch={true}
                            className="mt-3 flex w-full items-center justify-center rounded-lg border-2 border-[var(--brand)] bg-white px-3 py-2 text-xs font-bold text-[var(--brand)] uppercase transition-all hover:bg-[var(--brand)] hover:text-white"
                        >
                            <LucideFileText className="mr-1.5 h-3.5 w-3.5" />
                            Session Card
                        </Link>
                    </div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="py-12 text-center text-white/70">
                    {searchQuery ? `No ninjas found matching "${searchQuery}"` : 'No students found.'}
                </div>
            )}
        </div>
    )
}
