'use client'

import { useRouter } from 'next/navigation'
import { LucideArrowLeft, LucideGavel } from 'lucide-react'
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

export default function TermsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Back Button */}
                <AnimateOnScroll delay={75}>
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-white/70 hover:text-white font-bold transition-all"
                    >
                        <LucideArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>
                </AnimateOnScroll>

                {/* Content Card */}
                <AnimateOnScroll delay={150}>
                    <div className="glass-card overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple-100 rounded-2xl">
                                    <LucideGavel className="h-8 w-8 text-purple-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Terms of Service</h1>
                                    <p className="text-sm text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-12 text-gray-600 leading-relaxed">
                                <AnimateOnScroll>
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="h-6 w-1 bg-purple-500 rounded-full"></span>
                                            1. Acceptance of Terms
                                        </h2>
                                        <p>
                                            By accessing or using the Dojo Hub application, you agree to be bound by these Terms of Service.
                                            Our platform is designed to provide visibility into student's coding education, and your use signifies agreement to these guidelines.
                                        </p>
                                    </section>
                                </AnimateOnScroll>

                                <AnimateOnScroll>
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="h-6 w-1 bg-purple-500 rounded-full"></span>
                                            2. Use of Service
                                        </h2>
                                        <p>
                                            This service is provided exclusively to parents and guardians of students enrolled in the Code Ninjas programs at participating South Florida locations.
                                            You agree to provide accurate, current, and complete information during the registration process.
                                        </p>
                                    </section>
                                </AnimateOnScroll>

                                <AnimateOnScroll>
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="h-6 w-1 bg-purple-500 rounded-full"></span>
                                            3. User Accounts
                                        </h2>
                                        <p>
                                            As a ninja parent, you are responsible for maintaining the confidentiality of your account credentials.
                                            You are responsible for all activities that occur under your account and must notify us of any unauthorized access.
                                        </p>
                                    </section>
                                </AnimateOnScroll>

                                <AnimateOnScroll>
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="h-6 w-1 bg-purple-500 rounded-full"></span>
                                            4. Content & Progress
                                        </h2>
                                        <p>
                                            The progress reports, belt achievements, and Sensei notes provided are the property of your local Code Ninjas dojo.
                                            This data is provided for your personal use to monitor and support your child's education.
                                        </p>
                                    </section>
                                </AnimateOnScroll>

                                <AnimateOnScroll>
                                    <section>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="h-6 w-1 bg-purple-500 rounded-full"></span>
                                            5. Modifications
                                        </h2>
                                        <p>
                                            As our Dojo grows, we may update these terms. We will notify you of any changes by posting the new Terms of Service on this page.
                                            Your continued use after changes are made constitutes acceptance of the new terms.
                                        </p>
                                    </section>
                                </AnimateOnScroll>

                                <AnimateOnScroll>
                                    <section className="pt-8 border-t border-gray-100 mt-12">
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact</h2>
                                        <p>
                                            Got questions? We're here to help. Please contact your local Dojo Director for any clarifications regarding these terms.
                                        </p>
                                    </section>
                                </AnimateOnScroll>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>

                {/* Footer simple */}
                <AnimateOnScroll delay={300} bleed={true}>
                    <p className="text-center text-white/40 text-xs">
                        &copy; {new Date().getFullYear()} Dojo Hub. The Way of the Ninja.
                    </p>
                </AnimateOnScroll>
            </div>
        </div>
    )
}
