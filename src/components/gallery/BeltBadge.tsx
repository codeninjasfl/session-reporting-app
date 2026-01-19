'use client';

import { Belt, BELT_COLORS } from '@/lib/gallery-types';

interface BeltBadgeProps {
    belt: Belt;
}

export default function BeltBadge({ belt }: BeltBadgeProps) {
    const color = BELT_COLORS[belt];
    const textColor = ['white', 'yellow'].includes(belt) ? '#334155' : '#ffffff';

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
            style={{
                backgroundColor: color,
                color: textColor,
                border: belt === 'white' ? '1px solid #cbd5e1' : 'none',
            }}
        >
            <span
                className="w-2 h-2 rounded-full"
                style={{
                    backgroundColor: belt === 'white' ? '#94a3b8' : 'rgba(255,255,255,0.5)',
                }}
            />
            {belt} belt
        </span>
    );
}
