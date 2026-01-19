
import { createClient } from '@/utils/supabase/server'
import SessionCardView from '@/components/SessionCardView'

export const revalidate = 30 // Cache for 30 seconds

export default async function ParentPage() {
    const supabase = await createClient()

    // 1. Get current logged in parent
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Please log in</div>

    // 2. Fetch parent's children (students) and their session cards
    const { data: cards, error } = await supabase
        .from('session_cards')
        .select(`
        *,
        student:students(name, belt_color),
        sensei:profiles(full_name)
    `)
        .order('date', { ascending: false })

    if (error) {
        console.error(error)
        return <div className="text-red-500">Error loading data</div>
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
            <div className="text-center md:text-left dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-3xl font-bold uppercase">Ninja Progress</h1>
                <p>View your child's recent session reports</p>
            </div>

            <div className="space-y-8">
                {cards && cards.length > 0 ? (
                    cards.map((card: any, index: number) => (
                        <div
                            key={card.id}
                            className="animate-in slide-in-up"
                            style={{ animationDelay: `${150 + index * 75}ms` }}
                        >
                            <SessionCardView card={card} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 cn-card animate-in slide-in-up delay-150">
                        <p className="text-gray-500">No session cards available yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

