
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://olgmanfzkvjcmbzjkdvk.supabase.co'
const supabaseServiceKey = '***REMOVED***'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedFranchiseOwner() {
    console.log('--- Seeding Franchise Owner ---')
    const email = 'james.blasdel@codeninjas.com'
    const password = 'CodeNinjas1'

    // 1. Check if user exists
    let { data: { users }, error } = await supabase.auth.admin.listUsers()

    let user = users?.find(u => u.email === email)

    if (!user) {
        console.log('Creating new user...')
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })
        if (createError) {
            console.error('Error creating user:', createError)
            return
        }
        user = newUser.user!
        console.log('User created:', user.id)
    } else {
        console.log('User already exists:', user.id)
        // Optional: Update password if needed
        await supabase.auth.admin.updateUserById(user.id, { password })
        console.log('Password updated.')
    }

    // 2. Update Profile Role
    console.log('Updating profile role to franchise_owner...')
    // Note: This might fail if 'franchise_owner' is not yet in the ENUM. 
    // The user MUST run the SQL script first.
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            role: 'franchise_owner',
            assigned_dojo: 'Global' // Special marker for Global access
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
    } else {
        console.log('Profile updated successfully.')
    }
}

seedFranchiseOwner()
