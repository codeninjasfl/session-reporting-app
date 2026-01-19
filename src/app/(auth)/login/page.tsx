import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const error = typeof params?.error === 'string' ? params.error : null;
    const message = typeof params?.message === 'string' ? params.message : null;
    const email = typeof params?.email === 'string' ? params.email : '';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 animate-in fade-in" style={{ background: 'linear-gradient(180deg, var(--bg1), var(--bg2))' }}>
            <div className="cn-card w-full max-w-md space-y-8 p-8 border-t-4 border-[var(--brand)] animate-in slide-in-up delay-100">
                <div className="text-center flex flex-col items-center animate-in slide-in-up delay-150">
                    <Link href="/">
                        <img
                            src="https://www.codeninjas.com/hubfs/Group%201.svg"
                            alt="Code Ninjas"
                            className="h-12 w-auto mb-4 hover:scale-105 transition-transform"
                        />
                    </Link>
                    <h2 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                        Dojo Hub
                    </h2>
                </div>

                <form className="mt-8 space-y-6 animate-in slide-in-up delay-200">
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                defaultValue={email}
                                autoComplete="email"
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[var(--brand)] sm:text-sm sm:leading-6 px-3"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/auth/forgot-password" className="text-sm font-medium text-[var(--brand)] hover:text-blue-500">
                            Forgot your password?
                        </Link>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 animate-in fade-in">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-md bg-green-50 p-4 animate-in fade-in">
                            <div className="text-sm text-green-700">{message}</div>
                        </div>
                    )}

                    <div className="animate-in slide-in-up delay-300">
                        <button
                            formAction={login}
                            className="group relative flex w-full justify-center px-5 py-3 rounded-xl bg-[var(--brand)] text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Sign in
                        </button>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            New parent?{' '}
                            <Link href="/signup" className="font-semibold leading-6 text-[var(--brand)] hover:text-blue-500">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
