
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LandingPageClient from '@/components/LandingPageClient'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // All logged-in users land on Dojo Info first
    redirect('/info')
  }

  return <LandingPageClient />
}
