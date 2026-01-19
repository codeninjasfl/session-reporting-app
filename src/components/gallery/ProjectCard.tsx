'use client';

import Link from 'next/link';
import { Project } from '@/lib/gallery-types';
import { getPublicUrl } from '@/lib/gallery-supabase';
import BeltBadge from './BeltBadge';

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const imageUrl = getPublicUrl(project.png_path);

    return (
        <Link href={`/gallery/${project.id}`} className="block group">
            <div className="cn-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <img
                    className="w-full aspect-video object-cover bg-gray-200"
                    src={imageUrl}
                    alt={project.title}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect fill="%23e2e8f0" width="400" height="225"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16">No Preview</text></svg>';
                    }}
                />
                <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{project.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <BeltBadge belt={project.belt} />
                        <span className="text-sm text-gray-600">by {project.creator_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>📍 {project.location}</span>
                    </div>
                    {project.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            ⏳ Processing...
                        </span>
                    )}
                    {project.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            ❌ Error
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
