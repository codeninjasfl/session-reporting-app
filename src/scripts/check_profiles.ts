
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olgmanfzkvjcmbzjkdvk.supabase.co'
const supabaseServiceKey = '***REMOVED***'

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
