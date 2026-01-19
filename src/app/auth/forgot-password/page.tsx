
import Link from 'next/link'
import { sendPasswordReset } from './actions'

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 animate-in fade-in" style={{ background: 'linear-gradient(180deg, var(--bg1), var(--bg2))' }}>
            <div className="cn-card w-full max-w-md space-y-8 p-8 border-t-4 border-[var(--brand)] animate-in slide-in-up delay-100">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-[var(--foreground)] uppercase tracking-tight">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                            placeholder="Email address"
                        />
                    </div>

                    <div>
                        <button
                            formAction={sendPasswordReset}
                            className="group relative flex w-full justify-center px-5 py-3 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Send Reset Link
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/login" className="font-medium text-[var(--brand)] hover:text-blue-500">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
