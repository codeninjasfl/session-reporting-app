'use client'

import { useState } from 'react'
import { LucideEdit, LucideTrash2, LucideCheck, LucideX, LucideLoader2, LucideUserPlus, LucideLink, LucideUnlink, LucideFilter } from 'lucide-react'
import { updateUserProfile, deleteUser, searchStudents, linkStudentToParent, unlinkStudent } from './actions'

type Student = {
    id: string
    name: string
    belt_color: string
    assigned_dojo?: string
}

type Profile = {
    id: string
    email: string | null
    full_name: string | null
    role: 'parent' | 'sensei' | 'director' | 'franchise_owner'
    assigned_dojo: string | null
    created_at: string
    students?: Student[] // Linked children
}

const ROLE_OPTIONS = [
    { value: 'parent', label: 'Parent', color: 'bg-gray-100 text-gray-800' },
    { value: 'sensei', label: 'Sensei', color: 'bg-green-100 text-green-800' },
    { value: 'director', label: 'Director', color: 'bg-blue-100 text-blue-800' },
    { value: 'franchise_owner', label: 'Owner', color: 'bg-purple-100 text-purple-800' },
]

export default function AdminUserTable({ initialProfiles, currentUserRole }: { initialProfiles: any[], currentUserRole: string }) {
    const isOwner = currentUserRole === 'franchise_owner'
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
    const [search, setSearch] = useState('')
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10
    // Checkbox state for each role
    const [roleFilters, setRoleFilters] = useState<Record<string, boolean>>({
        parent: true,
        sensei: true,
        director: true,
        franchise_owner: true,
    })

    const toggleRoleFilter = (role: string) => {
        setRoleFilters(prev => ({ ...prev, [role]: !prev[role] }))
    }
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Linking State
    const [linkingParentId, setLinkingParentId] = useState<string | null>(null)
    const [studentSearch, setStudentSearch] = useState('')
    const [searchResults, setSearchResults] = useState<Student[]>([])
    const [isSearching, setIsSearching] = useState(false)


    // Edit Form State
    const [editForm, setEditForm] = useState<{ role: string, assigned_dojo: string }>({
        role: 'parent',
        assigned_dojo: 'Cooper City'
    })

    const filteredProfiles = profiles.filter(p => {
        // Text search
        const matchesSearch = (
            (p.email?.toLowerCase().includes(search.toLowerCase()) || '') ||
            (p.full_name?.toLowerCase().includes(search.toLowerCase()) || '') ||
            (p.role?.toLowerCase().includes(search.toLowerCase()) || '')
        )
        // Role filter (checkbox style - show if role is checked)
        const matchesRole = roleFilters[p.role] === true
        return matchesSearch && matchesRole
    })

    // Reset pagination when filter changes
    if (currentPage > 1 && filteredProfiles.length < (currentPage - 1) * ITEMS_PER_PAGE) {
        setCurrentPage(1)
    }

    const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE)
    const currentProfiles = filteredProfiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    // --- Editing Logic ---
    const handleEditClick = (profile: Profile) => {
        setEditingId(profile.id)
        setEditForm({
            role: profile.role || 'parent',
            assigned_dojo: profile.assigned_dojo || 'Cooper City'
        })
    }
    const handleCancelEdit = () => setEditingId(null)

    const handleSaveEdit = async () => {
        if (!editingId) return
        setIsSaving(true)
        try {
            await updateUserProfile(editingId, {
                role: editForm.role,
                assigned_dojo: editForm.assigned_dojo === 'None' ? null : editForm.assigned_dojo
            })
            // Optimistic update
            setProfiles(prev => prev.map(p =>
                p.id === editingId
                    ? { ...p, role: editForm.role as any, assigned_dojo: editForm.assigned_dojo === 'None' ? null : editForm.assigned_dojo }
                    : p
            ))
            setEditingId(null)
        } catch (error) {
            alert('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            await deleteUser(id)
            setProfiles(prev => prev.filter(p => p.id !== id))
        } catch (error) {
            alert('Failed to delete user')
        }
    }

    // --- Linking Logic ---
    const handleLinkClick = (parentId: string) => {
        setLinkingParentId(parentId)
        setStudentSearch('')
        setSearchResults([])
    }

    const handleSearchStudents = async (query: string) => {
        setStudentSearch(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        try {
            const results = await searchStudents(query)
            setSearchResults(results)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSelectStudent = async (student: Student) => {
        if (!linkingParentId) return
        try {
            await linkStudentToParent(student.id, linkingParentId)
            alert(`Linked ${student.name}`)
            // Rough Optimistic Update: Add student to parent's list
            setProfiles(prev => prev.map(p => {
                if (p.id === linkingParentId) {
                    return { ...p, students: [...(p.students || []), student] }
                }
                return p
            }))
            setLinkingParentId(null)
        } catch (error) {
            alert('Failed to link student')
        }
    }

    const handleUnlink = async (studentId: string, parentId: string) => {
        if (!confirm('Unlink this student?')) return
        try {
            await unlinkStudent(studentId)
            setProfiles(prev => prev.map(p => {
                if (p.id === parentId) {
                    return { ...p, students: p.students?.filter(s => s.id !== studentId) }
                }
                return p
            }))
        } catch (error) {
            alert('Failed to unlink')
        }
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand)]"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1) // Reset page on search
                        }}
                    />
                </div>

            </div>

            {/* Role Filter Checkboxes - Only for Franchise Owner */}
            {isOwner && (
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                        <LucideFilter className="h-4 w-4" />
                        Show:
                    </span>
                    {ROLE_OPTIONS.map(opt => (
                        <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer group whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={roleFilters[opt.value]}
                                onChange={() => {
                                    toggleRoleFilter(opt.value)
                                    setCurrentPage(1) // Reset page on filter
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                            />
                            <span className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${opt.color} group-hover:opacity-80 transition-opacity`}>
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-500">
                Showing {filteredProfiles.length} of {profiles.length} users
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dojo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Children</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentProfiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-gray-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-[var(--brand)] font-bold">
                                            {profile.email?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{profile.full_name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{profile.email}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === profile.id ? (
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm p-1"
                                        >
                                            <option value="parent">Parent</option>
                                            <option value="sensei">Sensei</option>
                                            <option value="director">Director</option>
                                            <option value="franchise_owner">Franchise Owner</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${profile.role === 'franchise_owner' ? 'bg-purple-100 text-purple-800' :
                                                profile.role === 'director' ? 'bg-blue-100 text-blue-800' :
                                                    profile.role === 'sensei' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {profile.role}
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === profile.id ? (
                                        <select
                                            value={editForm.assigned_dojo}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, assigned_dojo: e.target.value }))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm p-1"
                                        >
                                            <option value="Global">Global</option>
                                            <option value="Cooper City">Cooper City</option>
                                            <option value="Weston">Weston</option>
                                            <option value="Aventura">Aventura</option>
                                            <option value="None">None</option>
                                        </select>
                                    ) : (
                                        <div className="text-sm text-gray-900">{profile.assigned_dojo || '-'}</div>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        {profile.students && profile.students.length > 0 ? (
                                            profile.students.map(s => (
                                                <div key={s.id} className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit border border-blue-100">
                                                    <span className="font-medium">{s.name}</span>
                                                    <button
                                                        onClick={() => handleUnlink(s.id, profile.id)}
                                                        className="hover:text-red-500 transition-colors"
                                                        title="Unlink student"
                                                    >
                                                        <LucideUnlink className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            profile.role === 'parent' && <span className="text-xs text-gray-400 italic">No children linked</span>
                                        )}

                                        {profile.role === 'parent' && (
                                            <button
                                                onClick={() => handleLinkClick(profile.id)}
                                                className="text-xs text-[var(--brand)] hover:text-[var(--brand-dark)] font-medium flex items-center gap-1 mt-1 transition-colors"
                                            >
                                                <LucideLink className="h-3 w-3" /> Link Child
                                            </button>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isOwner && (
                                        editingId === profile.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700">
                                                    {isSaving ? <LucideLoader2 className="h-5 w-5 animate-spin" /> : <LucideCheck className="h-5 w-5" />}
                                                </button>
                                                <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                                                    <LucideX className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleEditClick(profile)} className="text-blue-600 hover:text-blue-700" title="Edit Role/Dojo">
                                                    <LucideEdit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`CRITICAL: Are you sure you want to permanently delete the user account for ${profile.full_name || profile.email}? This cannot be undone.`)) {
                                                            handleDelete(profile.id)
                                                        }
                                                    }}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <LucideTrash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex flex-1 items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProfiles.length)}</span> of <span className="font-medium">{filteredProfiles.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <span className="h-5 w-5 flex items-center justify-center">‹</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page ? 'z-10 bg-[var(--brand)] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <span className="h-5 w-5 flex items-center justify-center">›</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Linking Modal */}
            {linkingParentId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-4">Link Student to Parent</h3>
                        <input
                            type="text"
                            placeholder="Search student name..."
                            autoFocus
                            className="w-full border rounded-lg p-2 mb-4"
                            value={studentSearch}
                            onChange={(e) => handleSearchStudents(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {isSearching && <p className="text-sm text-gray-400">Searching...</p>}
                            {searchResults.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleSelectStudent(student)}
                                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="font-bold">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.assigned_dojo} • {student.belt_color}</p>
                                    </div>
                                    <LucideUserPlus className="h-4 w-4 text-gray-300 group-hover:text-[var(--brand)]" />
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setLinkingParentId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

