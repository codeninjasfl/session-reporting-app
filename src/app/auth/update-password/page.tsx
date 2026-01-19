
import { updatePassword } from './actions'

export default function UpdatePasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 animate-in fade-in" style={{ background: 'linear-gradient(180deg, var(--bg1), var(--bg2))' }}>
            <div className="cn-card w-full max-w-md space-y-8 p-8 border-t-4 border-[var(--brand)] animate-in slide-in-up delay-100">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-[var(--foreground)] uppercase tracking-tight">
                        New Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="password" className="sr-only">New Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                            placeholder="New Password"
                        />
                    </div>

                    <div>
                        <button
                            formAction={updatePassword}
                            className="group relative flex w-full justify-center px-5 py-3 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
