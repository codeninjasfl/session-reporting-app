'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectCard from '@/components/gallery/ProjectCard';
import { gallerySupabase } from '@/lib/gallery-supabase';
import { Project, Belt, Location, BELT_OPTIONS, LOCATION_OPTIONS } from '@/lib/gallery-types';

function GalleryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedBelt, setSelectedBelt] = useState<Belt | 'all'>(
        (searchParams.get('belt') as Belt) || 'all'
    );
    const [selectedLocation, setSelectedLocation] = useState<Location | 'all'>(
        (searchParams.get('location') as Location) || 'all'
    );

    useEffect(() => {
        fetchProjects();
    }, [selectedBelt, selectedLocation, search]);

    async function fetchProjects() {
        setLoading(true);

        let query = gallerySupabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (selectedBelt !== 'all') {
            query = query.eq('belt', selectedBelt);
        }

        if (selectedLocation !== 'all') {
            query = query.eq('location', selectedLocation);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,creator_name.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data || []);
        }

        setLoading(false);
    }

    function updateURL() {
        const params = new URLSearchParams();
        if (selectedBelt !== 'all') params.set('belt', selectedBelt);
        if (selectedLocation !== 'all') params.set('location', selectedLocation);
        if (search) params.set('search', search);
        router.push(`/gallery${params.toString() ? '?' + params.toString() : ''}`);
    }

    function handleBeltFilter(belt: Belt | 'all') {
        setSelectedBelt(belt);
    }

    function handleLocationFilter(location: Location | 'all') {
        setSelectedLocation(location);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        updateURL();
    }

    // Update URL when filters change
    useEffect(() => {
        updateURL();
    }, [selectedBelt, selectedLocation]);

    return (
        <div className="animate-in fade-in">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by project name or ninja name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px]"
                />
                <button type="submit" className="btn primary">Search</button>
            </form>

            {/* Location Filters */}
            <div className="mb-4">
                <p className="text-sm font-semibold text-white/80 mb-2">📍 Location</p>
                <div className="flex gap-2 flex-wrap">
                    <button
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedLocation === 'all'
                                ? 'bg-white text-blue-600'
                                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
                            }`}
                        onClick={() => handleLocationFilter('all')}
                    >
                        All Locations
                    </button>
                    {LOCATION_OPTIONS.map((location) => (
                        <button
                            key={location}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedLocation === location
                                    ? 'bg-white text-blue-600'
                                    : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
                                }`}
                            onClick={() => handleLocationFilter(location)}
                        >
                            {location}
                        </button>
                    ))}
                </div>
            </div>

            {/* Belt Filters */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-white/80 mb-2">🥋 Belt Level</p>
                <div className="flex gap-2 flex-wrap">
                    <button
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedBelt === 'all'
                                ? 'bg-white text-blue-600'
                                : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
                            }`}
                        onClick={() => handleBeltFilter('all')}
                    >
                        All Belts
                    </button>
                    {BELT_OPTIONS.map((belt) => (
                        <button
                            key={belt}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${selectedBelt === belt
                                    ? 'bg-white text-blue-600'
                                    : 'bg-white/15 text-white/90 border border-white/20 hover:bg-white/25'
                                }`}
                            onClick={() => handleBeltFilter(belt)}
                        >
                            {belt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block p-6 bg-white/10 rounded-2xl">
                        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white font-medium">Loading projects...</p>
                    </div>
                </div>
            ) : projects.length === 0 ? (
                <div className="cn-card text-center py-16 animate-in fade-in">
                    <div className="text-5xl mb-4">🎮</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500">
                        {search || selectedBelt !== 'all' || selectedLocation !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Be the first to upload a project!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            className="animate-in fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <ProjectCard project={project} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GalleryPageClient() {
    return (
        <Suspense fallback={
            <div className="text-center py-16">
                <div className="inline-block p-6 bg-white/10 rounded-2xl">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Loading...</p>
                </div>
            </div>
        }>
            <GalleryContent />
        </Suspense>
    );
}
