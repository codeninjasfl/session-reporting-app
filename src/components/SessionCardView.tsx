
import { LucideWrench, LucideTrophy, LucideGlobe } from 'lucide-react'

// Helper to parse levels or just display generic if dynamic
// In a real app, strict types for 'activities_completed' likely needed.
type SessionCardProps = {
    card: {
        id: string
        date: string
        activities_completed: string[] | null
        notes: string | null
        next_goals: string | null
        card_image_url?: string | null
        student: {
            name: string
            belt_color: string
        }
        sensei: {
            full_name: string
        } | null
    }
}

export default function SessionCardView({ card }: SessionCardProps) {
    // If visual card image exists, display it simply in a white box
    if (card.card_image_url) {
        return (
            <div className="cn-card overflow-hidden shadow-lg p-4 bg-white">
                <img
                    src={card.card_image_url}
                    alt={`Session card for ${card.student.name}`}
                    className="w-full rounded-lg"
                />
            </div>
        )
    }

    // Fallback to form-based display
    return (
        <div className="cn-card overflow-hidden shadow-xl border-2 border-slate-200 mt-6 transition-all duration-300 hover:shadow-2xl hover:border-blue-200">
            <div className="flex flex-col border-b-4 border-[var(--brand)] bg-gradient-to-r from-white to-gray-50 p-6 md:flex-row md:justify-between items-center">
                <div className="flex items-center w-full">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-black text-white p-1 shadow-lg transition-transform duration-300 hover:scale-110">
                        <span className="font-bold text-[10px]">NINJA</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black uppercase text-[var(--brand)] tracking-tighter">SESSION CARD</h2>
                        <div className="mt-1 flex flex-wrap gap-x-4 text-xs font-semibold text-gray-600">
                            <p>Ninja: <span className="text-gray-900">{card.student.name}</span></p>
                            <p>Sensei: <span className="text-gray-900">{card.sensei?.full_name || 'Staff'}</span></p>
                            <p>Date: <span className="text-gray-900">{new Date(card.date).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                </div>
                <div className="mt-2 md:mt-0 flex-shrink-0">
                    <span className="text-xl font-black uppercase text-[var(--brand)] px-3 py-1 bg-blue-50 rounded-full">{card.student.belt_color} BELT</span>
                </div>
            </div>

            <div className="bg-white p-6 space-y-4">
                {card.activities_completed && card.activities_completed.length > 0 ? (
                    <div>
                        <h4 className="font-bold text-[var(--brand)] mb-3 uppercase text-sm">Activities Completed</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {card.activities_completed.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:border-blue-200 hover:shadow-sm"
                                >
                                    <LucideWrench className="h-4 w-4 text-[var(--brand)]" />
                                    <span className="text-sm text-gray-700 font-medium">{activity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic">No specific activities marked.</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {card.notes && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border-l-4 border-[var(--brand)] transition-all duration-300 hover:shadow-md">
                            <h5 className="text-xs font-bold text-[var(--brand)] uppercase">Sensei Notes</h5>
                            <p className="text-sm text-gray-800 mt-1 leading-relaxed">{card.notes}</p>
                        </div>
                    )}
                    {card.next_goals && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-xl border-l-4 border-green-500 transition-all duration-300 hover:shadow-md">
                            <h5 className="text-xs font-bold text-green-600 uppercase">Next Goals</h5>
                            <p className="text-sm text-gray-800 mt-1 leading-relaxed">{card.next_goals}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
