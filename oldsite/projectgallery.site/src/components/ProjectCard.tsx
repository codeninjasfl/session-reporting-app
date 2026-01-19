'use client';

import Link from 'next/link';
import { Project } from '@/lib/types';
import { getPublicUrl } from '@/lib/supabase';
import BeltBadge from './BeltBadge';

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const imageUrl = getPublicUrl(project.png_path);

    return (
        <Link href={`/project/${project.id}`} className="project-card">
            <img
                className="thumbnail"
                src={imageUrl}
                alt={project.title}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect fill="%23e2e8f0" width="400" height="225"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16">No Preview</text></svg>';
                }}
            />
            <div className="content">
                <h3 className="title">{project.title}</h3>
                <div className="meta">
                    <BeltBadge belt={project.belt} />
                    <span>by {project.creator_name}</span>
                </div>
                <div className="meta" style={{ marginTop: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>📍 {project.location}</span>
                </div>
                {project.status === 'processing' && (
                    <span className="status-badge processing" style={{ marginTop: '8px' }}>
                        ⏳ Processing...
                    </span>
                )}
                {project.status === 'failed' && (
                    <span className="status-badge failed" style={{ marginTop: '8px' }}>
                        ❌ Error
                    </span>
                )}
            </div>
        </Link>
    );
}
