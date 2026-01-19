export type ProjectStatus = 'processing' | 'ready' | 'failed';

export type Belt =
    | 'white'
    | 'yellow'
    | 'orange'
    | 'green'
    | 'blue'
    | 'purple'
    | 'brown'
    | 'red'
    | 'black';

export type Location = 'Aventura' | 'Cooper City' | 'Weston';

export const LOCATION_OPTIONS: Location[] = ['Aventura', 'Cooper City', 'Weston'];

export interface Project {
    id: string;
    created_at: string;
    creator_name: string;
    location: Location;
    belt: Belt;
    title: string;
    description: string;
    png_path: string;
    status: ProjectStatus;
    makecode_url: string | null;
    embed_url: string | null;
    error_message: string | null;
    views: number;
    featured: boolean;
}

export interface Report {
    id: string;
    created_at: string;
    project_id: string;
    reason: string;
    details: string;
    reporter_ip: string | null;
}

export const BELT_COLORS: Record<Belt, string> = {
    white: '#f8fafc',
    yellow: '#fbbf24',
    orange: '#f97316',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    brown: '#92400e',
    red: '#ef4444',
    black: '#1f2937',
};

export const BELT_OPTIONS: Belt[] = [
    'white',
    'yellow',
    'orange',
    'green',
    'blue',
    'purple',
    'brown',
    'red',
    'black',
];
