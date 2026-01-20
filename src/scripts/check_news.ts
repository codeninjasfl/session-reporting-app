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

async function checkNews() {
    console.log('--- Checking News Table (Admin) ---')
    const { data: news, error } = await supabase
        .from('news')
        .select('*')

    if (error) {
        console.error('Error fetching news:', error)
    } else {
        console.log(`Found ${news?.length} news items:`)
        news?.forEach(n => {
            console.log(`- [${n.id}] Title: "${n.title}", Target: "${n.target_dojo}"`)
        })
    }
}

checkNews()
