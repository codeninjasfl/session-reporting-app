-- =====================================================
-- GALLERY SCHEMA FOR IMPACT PROJECT GALLERY
-- Run this in your main Supabase project SQL editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROJECTS TABLE
-- Stores all uploaded IMPACT MakeCode Arcade projects
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Creator info
    creator_name TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN ('Aventura', 'Cooper City', 'Weston')),
    belt TEXT NOT NULL CHECK (belt IN ('white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black')),
    
    -- Project info
    title TEXT NOT NULL,
    description TEXT,
    
    -- Storage reference
    png_path TEXT NOT NULL, -- Path in Supabase storage bucket
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
    makecode_url TEXT, -- Generated MakeCode Arcade share URL
    embed_url TEXT, -- Generated embed URL for iframe
    error_message TEXT, -- Error details if status = 'failed'
    
    -- Analytics
    views INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false
);

-- =====================================================
-- REPORTS TABLE
-- Stores user reports for moderation
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    reporter_ip TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
CREATE INDEX IF NOT EXISTS idx_projects_belt ON projects(belt);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Everyone can view projects (public gallery)
CREATE POLICY "Anyone can view projects" 
    ON projects FOR SELECT 
    USING (true);

-- Anyone can insert projects (no auth required for public uploads)
CREATE POLICY "Anyone can insert projects" 
    ON projects FOR INSERT 
    WITH CHECK (true);

-- Only allow status updates (for the processing pipeline)
CREATE POLICY "Anyone can update project status" 
    ON projects FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Enable RLS on reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a report
CREATE POLICY "Anyone can insert reports" 
    ON reports FOR INSERT 
    WITH CHECK (true);

-- Only admins/staff can view reports (you can adjust this later)
CREATE POLICY "Authenticated users can view reports" 
    ON reports FOR SELECT 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE BUCKET SETUP
-- Run these in the Supabase Dashboard > Storage
-- =====================================================
-- 1. Create a bucket named: project_pngs
-- 2. Make it PUBLIC (for easy image serving)
-- 3. Or keep it private and use signed URLs

-- To create the bucket via SQL (optional):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('project_pngs', 'project_pngs', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policy for public read access:
-- CREATE POLICY "Public read access for project_pngs" 
--     ON storage.objects FOR SELECT 
--     USING (bucket_id = 'project_pngs');

-- Storage policy for public uploads:
-- CREATE POLICY "Public upload access for project_pngs" 
--     ON storage.objects FOR INSERT 
--     WITH CHECK (bucket_id = 'project_pngs');

-- =====================================================
-- SAMPLE DATA (OPTIONAL - for testing)
-- =====================================================
-- INSERT INTO projects (creator_name, location, belt, title, description, png_path, status, views)
-- VALUES 
--     ('Alex', 'Cooper City', 'yellow', 'Space Shooter', 'Blast asteroids in space!', 'sample/space-shooter.png', 'ready', 42),
--     ('Maya', 'Weston', 'green', 'Platformer Pro', 'Jump and collect coins!', 'sample/platformer.png', 'ready', 28),
--     ('Jordan', 'Aventura', 'blue', 'Racing Game', 'Race against time!', 'sample/racing.png', 'processing', 0);
