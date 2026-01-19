'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { supabase } from '@/lib/supabase';
import { Project, Belt, Location, BELT_OPTIONS, LOCATION_OPTIONS } from '@/lib/types';

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

        let query = supabase
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
        <div className="fade-in">
            <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '8px' }}>
                Project Gallery
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '32px' }}>
                Discover amazing games built by ninjas like you!
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="search-bar">
                <input
                    type="text"
                    placeholder="Search by project name or ninja name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn primary">Search</button>
            </form>

            {/* Location Filters */}
            <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
                    📍 Location
                </p>
                <div className="filter-chips">
                    <button
                        className={`filter-chip ${selectedLocation === 'all' ? 'active' : ''}`}
                        onClick={() => handleLocationFilter('all')}
                    >
                        All Locations
                    </button>
                    {LOCATION_OPTIONS.map((location) => (
                        <button
                            key={location}
                            className={`filter-chip ${selectedLocation === location ? 'active' : ''}`}
                            onClick={() => handleLocationFilter(location)}
                        >
                            {location}
                        </button>
                    ))}
                </div>
            </div>

            {/* Belt Filters */}
            <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
                    🥋 Belt Level
                </p>
                <div className="filter-chips">
                    <button
                        className={`filter-chip ${selectedBelt === 'all' ? 'active' : ''}`}
                        onClick={() => handleBeltFilter('all')}
                    >
                        All Belts
                    </button>
                    {BELT_OPTIONS.map((belt) => (
                        <button
                            key={belt}
                            className={`filter-chip ${selectedBelt === belt ? 'active' : ''}`}
                            onClick={() => handleBeltFilter(belt)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {belt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#fff' }}>
                    <div className="processing-state" style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block' }}>
                        <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                        <p style={{ color: '#fff' }}>Loading projects...</p>
                    </div>
                </div>
            ) : projects.length === 0 ? (
                <div className="card fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
                    <h3 style={{ marginBottom: '8px' }}>No projects found</h3>
                    <p style={{ color: 'var(--muted)' }}>
                        {search || selectedBelt !== 'all' || selectedLocation !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Be the first to upload a project!'}
                    </p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {projects.map((project, index) => (
                        <div key={project.id} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                            <ProjectCard project={project} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GalleryPage() {
    return (
        <>
            <Header />

            <section className="container" style={{ padding: '40px 20px' }}>
                <Suspense fallback={
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#fff' }}>
                        <div className="processing-state" style={{ background: 'rgba(255,255,255,0.1)', display: 'inline-block' }}>
                            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                            <p style={{ color: '#fff' }}>Loading...</p>
                        </div>
                    </div>
                }>
                    <GalleryContent />
                </Suspense>
            </section>

            <footer className="footer">
                <p>Made with ❤️ at Code Ninjas FL</p>
            </footer>
        </>
    );
}
