
import { createClient } from '@/utils/supabase/server'
import { LucideNewspaper } from 'lucide-react'
import MarkdownContent from '@/components/MarkdownContent'

export const revalidate = 0 // Cache disabled for immediate updates during dev

export default async function NewsFeedPage() {
    const supabase = await createClient()

    // Get current user's dojo and role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_dojo, role')
        .eq('id', user?.id)
        .single()

    const userDojo = profile?.assigned_dojo
    const userRole = profile?.role

    // Fetch all news (limit to 50 for now)
    const { data: allNews, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('NewsFeed: Error fetching news:', error)
    }

    // Filter logic
    const newsList = allNews?.filter(item => {
        // Franchise owners see everything
        if (userRole === 'franchise_owner') return true

        // Others see Global + their Dojo
        if (!item.target_dojo || item.target_dojo === 'Global') return true
        if (userDojo && item.target_dojo === userDojo) return true
        return false
    })


    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="dashboard-header animate-in slide-in-up delay-100">
                <h1 className="text-3xl font-bold uppercase">Dojo News</h1>
                <p>Announcements and updates from your Senseis and Director</p>
            </div>

            <div className="space-y-6">
                {newsList && newsList.length > 0 ? (
                    newsList.map((news, index) => (
                        <div
                            key={news.id}
                            className="cn-card p-6 border-l-4 border-[var(--brand)] animate-in slide-in-up hover:border-l-blue-400"
                            style={{ animationDelay: `${150 + index * 50}ms` }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-[var(--ink)]">{news.title}</h3>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {new Date(news.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {news.target_dojo && news.target_dojo !== 'Global' && (
                                <span className="inline-block text-xs font-semibold text-[var(--brand)] uppercase mb-3 px-2 py-0.5 bg-blue-50 rounded-full">
                                    {news.target_dojo}
                                </span>
                            )}
                            <MarkdownContent content={news.content} />
                        </div>
                    ))
                ) : (
                    <div className="cn-card p-12 text-center text-gray-500">
                        <LucideNewspaper className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No news items found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

