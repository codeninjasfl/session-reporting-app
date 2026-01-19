// This Edge Function publishes MakeCode Arcade projects by automating the share process
// It runs in the background after a project is uploaded

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Puppeteer for Deno
// Note: In production, you'd use a service like Browserless or AWS Lambda with Puppeteer Layer

interface ProjectPayload {
    projectId: string
    pngUrl: string
    title: string
}

serve(async (req: Request) => {
    try {
        const { projectId, pngUrl, title } = await req.json() as ProjectPayload

        if (!projectId || !pngUrl) {
            return new Response(
                JSON.stringify({ error: 'Missing projectId or pngUrl' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // For now, we'll use the importurl approach since we can't run headless browser in edge functions
        // The embed URL will be set using the importurl format
        // This works when opened directly but not in iframes

        const importUrl = `https://arcade.makecode.com/?importurl=${encodeURIComponent(pngUrl)}`

        // Update the project with the MakeCode URL
        // Note: This URL opens MakeCode with the project pre-loaded
        // For true embedding, we'd need a share ID from MakeCode's internal API
        const { error: updateError } = await supabase
            .from('projects')
            .update({
                makecode_url: importUrl,
                // embed_url would be set if we had a share ID: `https://arcade.makecode.com/<shareId>`
            })
            .eq('id', projectId)

        if (updateError) {
            console.error('Failed to update project:', updateError)
            return new Response(
                JSON.stringify({ error: 'Failed to update project' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                makecodeUrl: importUrl,
                message: 'Project URL set. For full embedding, a headless browser service would be needed.'
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
