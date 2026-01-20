import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY')
    console.error('Make sure .env.local file exists with these values.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfiles() {
    console.log('--- Checking Profiles (Admin) ---')
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, role, assigned_dojo')

    if (error) {
        console.error('Error fetching profiles:', error)
    } else {
        console.log(`Found ${profiles?.length} profiles:`)
        profiles?.forEach(p => {
            console.log(`- ${p.email} (${p.role}): Dojo="${p.assigned_dojo}"`)
        })
    }
}

checkProfiles()
