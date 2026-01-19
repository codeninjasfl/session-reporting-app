import { Belt, BELT_COLORS } from '@/lib/types';

interface BeltBadgeProps {
    belt: Belt;
}

export default function BeltBadge({ belt }: BeltBadgeProps) {
    const color = BELT_COLORS[belt];
    const textColor = ['white', 'yellow'].includes(belt) ? '#334155' : '#ffffff';

    return (
        <span
            className="belt-badge"
            style={{
                backgroundColor: color,
                color: textColor,
                border: belt === 'white' ? '1px solid #cbd5e1' : 'none',
            }}
        >
            <span
                className="dot"
                style={{
                    backgroundColor: belt === 'white' ? '#94a3b8' : 'rgba(255,255,255,0.5)',
                }}
            />
            {belt} belt
        </span>
    );
}
