-- =====================================================
-- IMPORT MIGRATED GALLERY PROJECTS
-- Run this AFTER:
-- 1. Running gallery_schema.sql to create the tables
-- 2. Uploading the 3 PNG images to the project_pngs bucket
-- =====================================================

INSERT INTO projects (id, created_at, creator_name, belt, title, description, png_path, status, makecode_url, embed_url, error_message, views, featured, location)
VALUES 
  (
    'eb48dff1-7823-4ba2-a09c-2c49dba12a39',
    '2026-01-10T03:29:37.585962+00:00',
    'Aaryan',
    'yellow',
    'Aaryan''s Belt Belt-Up Project!',
    '',
    '1768015776751_arcade-Untitled__4_.png',
    'ready',
    'https://arcade.makecode.com/?importurl=https%3A%2F%2Folgmanfzkvjcmbzjkdvk.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fproject_pngs%2F1768015776751_arcade-Untitled__4_.png',
    NULL,
    NULL,
    22,
    false,
    'Cooper City'
  ),
  (
    '6eb6ab31-7219-4e94-a9de-86a0754634a6',
    '2026-01-10T03:08:35.578124+00:00',
    'Sensei Alexis & Aidan',
    'black',
    'Road To Becoming Champion',
    'For the Champions Game Jam!',
    '1768014514714_arcade-Road-To-Becoming-Champion---2---Copy.png',
    'ready',
    'https://arcade.makecode.com/?importurl=https%3A%2F%2Folgmanfzkvjcmbzjkdvk.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fproject_pngs%2F1768014514714_arcade-Road-To-Becoming-Champion---2---Copy.png',
    'https://tsrray.github.io/road-to-becoming-champion-final/',
    NULL,
    20,
    true,
    'Cooper City'
  ),
  (
    'c8b224c4-0d46-478a-93fe-9ce903a96624',
    '2026-01-09T23:19:27.585363+00:00',
    'John Doe',
    'white',
    'test',
    'testing testing 123',
    '1768000766938_arcade-Untitled.png',
    'ready',
    'https://arcade.makecode.com/?importurl=https%3A%2F%2Folgmanfzkvjcmbzjkdvk.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fproject_pngs%2F1768000766938_arcade-Untitled.png',
    NULL,
    NULL,
    214,
    false,
    'Aventura'
  )
ON CONFLICT (id) DO UPDATE SET
  makecode_url = EXCLUDED.makecode_url,
  embed_url = EXCLUDED.embed_url,
  png_path = EXCLUDED.png_path;
