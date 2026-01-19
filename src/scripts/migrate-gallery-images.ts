/**
 * Migration Script: Download images from old Supabase and prepare for upload to new one
 * 
 * Run with: npx ts-node --esm src/scripts/migrate-gallery-images.ts
 * 
 * This script:
 * 1. Connects to the OLD gallery Supabase project
 * 2. Fetches all projects and their image paths
 * 3. Downloads images locally
 * 4. You can then manually upload them to the new bucket, 
 *    or extend this script to upload automatically
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// OLD Gallery Supabase credentials
const OLD_SUPABASE_URL = 'https://fmctxftcjtgxvedching.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3R4ZnRjanRneHZlZGNoaW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTE4MzYsImV4cCI6MjA4MzU2NzgzNn0.R-z616-Aci8hjx7P-ZoXOhrxxxI2x0FZqthjQCZ0UFo';

// NEW Session Reporting Supabase credentials
const NEW_SUPABASE_URL = 'https://olgmanfzkvjcmbzjkdvk.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ21hbmZ6a3ZqY21iemprZHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTEzMzgsImV4cCI6MjA4NDA4NzMzOH0.b9VcftTBXSo-RAIzZHo8PUCngidrEjZWFdqaXQRsqnQ';

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

const DOWNLOAD_DIR = './migrated_gallery_images';

async function main() {
    console.log('🔄 Starting Gallery Migration...\n');

    // Create download directory
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }

    // 1. Fetch all projects from OLD database
    console.log('📋 Fetching projects from old database...');
    const { data: projects, error } = await oldSupabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching projects:', error);
        return;
    }

    console.log(`✅ Found ${projects?.length || 0} projects\n`);

    if (!projects || projects.length === 0) {
        console.log('No projects to migrate.');
        return;
    }

    // 2. Download each image
    console.log('📥 Downloading images...\n');

    for (const project of projects) {
        const pngPath = project.png_path;
        if (!pngPath) {
            console.log(`⚠️  Skipping project "${project.title}" - no PNG path`);
            continue;
        }

        // Get public URL from old bucket
        const { data: urlData } = oldSupabase.storage.from('project_pngs').getPublicUrl(pngPath);
        const imageUrl = urlData.publicUrl;

        console.log(`  Downloading: ${project.title}`);
        console.log(`    Path: ${pngPath}`);
        console.log(`    URL: ${imageUrl}`);

        try {
            // Download the image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                console.log(`    ❌ Failed to download (${response.status})`);
                continue;
            }

            const buffer = await response.arrayBuffer();

            // Save locally with the same path structure
            const localPath = path.join(DOWNLOAD_DIR, pngPath);
            const localDir = path.dirname(localPath);

            if (!fs.existsSync(localDir)) {
                fs.mkdirSync(localDir, { recursive: true });
            }

            fs.writeFileSync(localPath, Buffer.from(buffer));
            console.log(`    ✅ Saved to ${localPath}\n`);

        } catch (err) {
            console.log(`    ❌ Error: ${err}\n`);
        }
    }

    // 3. Export project data as JSON for re-importing
    const exportPath = path.join(DOWNLOAD_DIR, 'projects_export.json');
    fs.writeFileSync(exportPath, JSON.stringify(projects, null, 2));
    console.log(`\n📄 Exported project data to ${exportPath}`);

    console.log('\n✅ Migration download complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to your NEW Supabase project > Storage > project_pngs');
    console.log('   2. Upload the images from ./migrated_gallery_images/');
    console.log('   3. Run the SQL in gallery_schema.sql to create the tables');
    console.log('   4. Import the project records from projects_export.json');
}

main().catch(console.error);
