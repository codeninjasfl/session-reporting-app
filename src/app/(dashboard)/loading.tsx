
export default function Loading() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-10 w-64 bg-white/20 rounded-lg"></div>
            <div className="h-4 w-48 bg-white/10 rounded-lg mb-8"></div>

            <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-white/10 rounded-2xl"></div>
                ))}
            </div>
        </div>
    )
}
