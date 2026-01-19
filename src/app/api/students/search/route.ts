import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Search for students by name (for parent signup autocomplete)
 * Only returns students that don't have a parent yet
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const location = searchParams.get('location');

    if (!query || query.length < 2) {
        return NextResponse.json({ students: [] });
    }

    try {
        const adminSupabase = createAdminClient();

        let dbQuery = adminSupabase
            .from('students')
            .select('id, name, belt_color, assigned_dojo')
            .is('parent_id', null) // Only unassigned students
            .ilike('name', `%${query}%`)
            .limit(10);

        // Optionally filter by location
        if (location) {
            dbQuery = dbQuery.eq('assigned_dojo', location);
        }

        const { data: students, error } = await dbQuery;

        if (error) {
            console.error('Student search error:', error);
            return NextResponse.json({ students: [], error: error.message }, { status: 500 });
        }

        return NextResponse.json({ students: students || [] });
    } catch (error) {
        console.error('Student search error:', error);
        return NextResponse.json({ students: [], error: 'Search failed' }, { status: 500 });
    }
}
