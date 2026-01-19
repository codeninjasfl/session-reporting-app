
import { createClient } from '@/utils/supabase/server'
import { LucideMapPin, LucideNewspaper, LucidePhone, LucideClock, LucideNavigation, LucideExternalLink, LucideAward, LucideHelpCircle, LucideMail } from 'lucide-react'
import MarkdownContent from '@/components/MarkdownContent'
import Link from 'next/link'

export const revalidate = 0 // Cache disabled for immediate updates during dev

// Belt colors for the progression chart
const BELT_ORDER = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black']
const BELT_COLORS: Record<string, string> = {
    white: 'bg-gray-100 border-gray-300',
    yellow: 'bg-yellow-300 border-yellow-500',
    orange: 'bg-orange-400 border-orange-600',
    green: 'bg-green-500 border-green-700',
    blue: 'bg-blue-500 border-blue-700',
    purple: 'bg-purple-500 border-purple-700',
    brown: 'bg-amber-700 border-amber-900',
    red: 'bg-red-600 border-red-800',
    black: 'bg-gray-900 border-black',
}

export default async function DojoInfoPage() {
    const supabase = await createClient()

    // Get current user's dojo and role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('assigned_dojo, role, full_name')
        .eq('id', user?.id)
        .single()

    const userDojo = profile?.assigned_dojo
    const userRole = profile?.role
    const userName = profile?.full_name

    // Fetch linked students for parents
    const { data: linkedStudents } = await supabase
        .from('students')
        .select('id, name, belt_color')
        .eq('parent_id', user?.id)

    // Fetch all news for client-side filtering
    const { data: allNews } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    const news = allNews?.filter(item => {
        if (userRole === 'franchise_owner') return true
        if (!item.target_dojo || item.target_dojo === 'Global') return true
        if (userDojo && item.target_dojo === userDojo) return true
        return false
    })


    const dojos: Record<string, { address: string, city: string, zip: string, phone: string, hours: string, mapUrl: string }> = {
        'Cooper City': {
            address: '5534 S Flamingo Rd',
            city: 'Cooper City, FL',
            zip: '33330',
            phone: '(954) 323-4555',
            hours: 'Mon-Fri: 3pm-7pm, Sat: 10am-3pm',
            mapUrl: 'https://maps.google.com/?q=5534+S+Flamingo+Rd+Cooper+City+FL+33330'
        },
        'Weston': {
            address: '1374 SW 160th Ave, Suite E-3/E-4',
            city: 'Weston, FL',
            zip: '33326',
            phone: '(954) 727-8797',
            hours: 'Mon-Fri: 3pm-7pm, Sat: 10am-2pm',
            mapUrl: 'https://maps.google.com/?q=1374+SW+160th+Ave+Suite+E3+Weston+FL+33326'
        },
        'Aventura': {
            address: '18999 Biscayne Blvd, Suite 200',
            city: 'Aventura, FL',
            zip: '33180',
            phone: '(786) 592-6300',
            hours: 'Mon-Fri: 3pm-7pm, Sat: 10am-2pm',
            mapUrl: 'https://maps.google.com/?q=18999+Biscayne+Blvd+Suite+200+Aventura+FL+33180'
        }
    }

    const currentDojoInfo = userDojo ? dojos[userDojo] : null

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
            {/* Page Title */}
            <div className="animate-in slide-in-up delay-75">
                <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm">Dojo Information</h1>
                <p className="text-white/80 text-lg font-medium">Everything you need to know about your center.</p>
            </div>

            {/* Hero Card */}
            <div className="cn-card p-6 animate-in slide-in-up delay-100 bg-white border border-gray-200 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            {userRole === 'franchise_owner' ? `Welcome, ${userName || 'Owner'}!` : (userDojo ? `Code Ninjas ${userDojo}` : 'Code Ninjas FL')}
                        </h2>
                        {currentDojoInfo ? (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-lg"><LucideMapPin className="h-5 w-5 flex-shrink-0 text-blue-600" /></div>
                                    <span className="font-semibold text-lg text-gray-800">{currentDojoInfo.address}, {currentDojoInfo.city} {currentDojoInfo.zip}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-lg"><LucidePhone className="h-5 w-5 flex-shrink-0 text-blue-600" /></div>
                                    <a href={`tel:${currentDojoInfo.phone}`} className="hover:text-blue-600 underline decoration-blue-300 font-semibold text-lg text-gray-800">{currentDojoInfo.phone}</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-lg"><LucideClock className="h-5 w-5 flex-shrink-0 text-blue-600" /></div>
                                    <span className="font-semibold text-lg text-gray-800">{currentDojoInfo.hours}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-gray-600">Stay connected with Code Ninjas FL</p>
                        )}
                    </div>
                    {currentDojoInfo && (
                        <div className="flex gap-3 flex-wrap">
                            <a
                                href={`tel:${currentDojoInfo.phone}`}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg uppercase tracking-wider text-sm"
                            >
                                <LucidePhone className="h-5 w-5" /> CALL NOW
                            </a>
                            <a
                                href={currentDojoInfo.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 uppercase tracking-wider text-sm"
                            >
                                <LucideNavigation className="h-5 w-5" /> DIRECTIONS
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Access */}
            <div className="animate-in slide-in-up delay-250">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <LucideExternalLink className="h-7 w-7 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Quick Access</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <a
                        href="https://arcade.makecode.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cn-card flex flex-col items-center gap-3 p-6 text-center group hover:shadow-xl"
                    >
                        <div className="p-4 bg-blue-500 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                            <LucideExternalLink className="h-8 w-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-gray-800">MakeCode</span>
                    </a>
                    <a
                        href="https://www.codeninjas.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cn-card flex flex-col items-center gap-3 p-6 text-center group hover:shadow-xl"
                    >
                        <div className="p-4 bg-red-600 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                            <LucideExternalLink className="h-8 w-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-gray-800">CN Home</span>
                    </a>
                    <a
                        href="https://www.codeninjas.com/faq"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cn-card flex flex-col items-center gap-3 p-6 text-center group hover:shadow-xl"
                    >
                        <div className="p-4 bg-green-500 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                            <LucideHelpCircle className="h-8 w-8" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-gray-800">FAQ</span>
                    </a>
                </div>
            </div>



            {/* News Section */}
            <div className="animate-in slide-in-up delay-350">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <LucideNewspaper className="h-7 w-7 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Latest Announcements</h2>
                </div>

                <div className="space-y-6">
                    {news && news.length > 0 ? (
                        news.map((item, index) => (
                            <div
                                key={item.id}
                                className="cn-card p-8 border-l-8 border-blue-500 shadow-xl hover:shadow-2xl transition-shadow"
                                style={{ animationDelay: `${400 + index * 50}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                    <h3 className="font-black text-2xl text-gray-900 tracking-tight leading-none">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                                        <LucideClock className="h-4 w-4" />
                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                {item.target_dojo && item.target_dojo !== 'Global' && (
                                    <span className="inline-flex items-center gap-2 text-xs font-black text-white uppercase mb-6 px-4 py-1.5 bg-blue-600 rounded-lg shadow-md">
                                        <LucideMapPin className="h-3 w-3" />
                                        {item.target_dojo}
                                    </span>
                                )}
                                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium">
                                    <MarkdownContent content={item.content} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="cn-card p-16 text-center">
                            <LucideNewspaper className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-2xl font-black text-gray-400 uppercase tracking-widest">No News Today</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
