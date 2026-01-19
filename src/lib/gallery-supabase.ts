import { createClient } from '@supabase/supabase-js';

// Gallery uses the same Supabase project as the main session-reporting app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const gallerySupabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get public URL for an image
export function getPublicUrl(path: string): string {
    const { data } = gallerySupabase.storage.from('project_pngs').getPublicUrl(path);
    return data.publicUrl;
}
