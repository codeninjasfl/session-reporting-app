
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olgmanfzkvjcmbzjkdvk.supabase.co'
const supabaseServiceKey = '***REMOVED***'

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
