'use client';

import { useState, useEffect, useRef } from 'react';
import { LucideCheck, LucideUser } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    belt_color: string;
    assigned_dojo: string;
}

interface ChildNameInputProps {
    index: number;
    location: string;
    onStudentSelect?: (student: Student | null) => void;
}

const BELT_COLORS: Record<string, string> = {
    white: 'bg-gray-100 text-gray-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    brown: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    black: 'bg-gray-800 text-white',
};

export default function ChildNameInput({ index, location, onStudentSelect }: ChildNameInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Student[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({ q: query });
                if (location) params.append('location', location);

                const res = await fetch(`/api/students/search?${params}`);
                const data = await res.json();
                setSuggestions(data.students || []);
                setIsOpen(data.students?.length > 0);
            } catch (err) {
                console.error('Search failed:', err);
                setSuggestions([]);
            }
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, location]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (student: Student) => {
        setQuery(student.name);
        setSelectedStudent(student);
        setIsOpen(false);
        onStudentSelect?.(student);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setSelectedStudent(null);
        onStudentSelect?.(null);
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div ref={containerRef} className="relative flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--brand)] text-white flex items-center justify-center text-xs font-bold">
                {index + 1}
            </div>

            <div className="relative flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    name={`childName${index}`}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    required
                    autoComplete="off"
                    className={`block w-full rounded-md border-0 py-1.5 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ${selectedStudent ? 'ring-green-400 bg-green-50' : 'ring-gray-300'
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3`}
                    placeholder={`Child ${index + 1} First Name`}
                />

                {/* Hidden field to pass selected student ID */}
                {selectedStudent && (
                    <input type="hidden" name={`childStudentId${index}`} value={selectedStudent.id} />
                )}

                {/* Selected checkmark */}
                {selectedStudent && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <LucideCheck className="h-4 w-4 text-green-600" />
                    </div>
                )}

                {/* Loading spinner */}
                {isLoading && !selectedStudent && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin" />
                    </div>
                )}

                {/* Dropdown */}
                {isOpen && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-auto">
                        <div className="p-2 text-xs text-gray-500 border-b bg-gray-50 font-medium">
                            Found {suggestions.length} matching ninja{suggestions.length > 1 ? 's' : ''} at {location || 'any dojo'}
                        </div>
                        {suggestions.map((student) => (
                            <button
                                key={student.id}
                                type="button"
                                onClick={() => handleSelect(student)}
                                className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between gap-2 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <LucideUser className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{student.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${BELT_COLORS[student.belt_color?.toLowerCase()] || BELT_COLORS.white}`}>
                                        {student.belt_color || 'white'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
