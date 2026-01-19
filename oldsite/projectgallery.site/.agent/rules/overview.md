---
trigger: always_on
---

## IMPACT Project Gallery — Website Overview (No Login, Supabase Backend)

### What it is

A public, kid-friendly gallery website for Code Ninjas where anyone (kids or Senseis) can post their **IMPACT MakeCode Arcade projects** using the **special screenshot PNG** (the one that contains the game code). Each upload becomes:

* a **gallery card** (image + title + belt + creator name)
* a **project detail page** (full info + share link)
* a **generated MakeCode Arcade project** created automatically in the background by importing the PNG.

---

# Core Experience

## 1) Upload → Post Flow

**Entry point:** “Upload Project” page

**Steps**

1. User drags/drops or selects the **IMPACT screenshot PNG**
2. Fills out:

   * **Name** (display name / first name or nickname)
   * **Belt** (dropdown)
   * **Project Name**
   * **Description**
3. Submits upload
4. UI immediately creates a post with status:

   * **Processing** (while conversion runs)
5. Once conversion finishes, post becomes:

   * **Ready** (and shows a playable/embed link)

**Key UI states**

* Upload validation errors (wrong file type, too large, missing fields)
* Processing status with friendly messaging: “Building your game…”
* Success screen with share link + “View in Gallery”

---

## 2) Browse → Discover Flow

**Gallery page**

* Grid of projects (newest first by default)
* Filters:

  * **Belt**
  * Sort: Newest / Featured (optional) / Most viewed (optional)
* Search by project title or creator name
* Infinite scroll or pagination

**Project detail page**

* Project image preview
* Name, belt, title, description
* “Made with IMPACT / MakeCode Arcade”
* **Play / Open** buttons once ready
* Share link + “Copy link” button

---

# Background Automation (Core Differentiator)

## Goal

Turn the uploaded PNG into a **real MakeCode Arcade project** automatically.

## Pipeline

1. Upload PNG to **Supabase Storage**
2. Insert row in **Supabase Postgres** with status = `processing`
3. Trigger conversion job (recommended via Supabase Edge Function + queue pattern)
4. Conversion job:

   * Validates PNG is a MakeCode Arcade screenshot (basic checks)
   * Creates a new MakeCode Arcade project
   * Imports the PNG to restore code
   * Returns:

     * a share URL (or embed URL)
     * optional project id/metadata
5. Update database row:

   * status = `ready`
   * store `makecode_url` / `embed_url`
   * store timestamps and any metadata

**Important note:** In practice, “autonomously drag the PNG into MakeCode” should be implemented as an automated import flow (API-based if possible). If MakeCode has no supported API for project creation/import, you’ll need a controlled headless automation step; the site should treat this as an asynchronous worker and not block the UI.

---

# Pages / Information Architecture

## 1) Home (optional)

* Hero: “Share your IMPACT creations”
* Featured projects strip (optional)
* “Upload Project” CTA
* “Browse Gallery” CTA

## 2) Gallery

* Search bar (title / name)
* Belt filter chips
* Project grid cards:

  * thumbnail
  * project title
  * belt badge
  * creator name
  * status tag if processing

## 3) Project Detail

* Large preview image
* Title + belt + creator
* Description
* If `processing`: progress message + refresh hint
* If `ready`: Play/Open buttons + share tools

## 4) Upload Project

* Drag/drop uploader
* Fields: name, belt, title, description
* Submit button
* Inline content guidelines (simple)

## 5) About / How it Works (optional)

* “Take a screenshot in IMPACT”
* “Upload it here”
* “We rebuild your game automatically”

---

# Supabase Backend Design

## Database table: `projects`

Minimum fields:

* `id` (uuid)
* `created_at` (timestamp)
* `creator_name` (text)
* `belt` (text enum)
* `title` (text)
* `description` (text)
* `png_path` (text) — storage path
* `status` (text: `processing | ready | failed`)
* `makecode_url` (text, nullable)
* `embed_url` (text, nullable)
* `error_message` (text, nullable)
* Optional:

  * `views` (int)
  * `featured` (bool)

## Supabase Storage buckets

* `project_pngs` (private or public; if private, use signed URLs)
* (optional) `thumbnails` if you generate resized images

## Edge Functions / Workers

* `create_project` (validates + inserts row + stores file)
* `process_project` (conversion job runner)
* (optional) `increment_view` (simple analytics)
* (optional) `generate_thumbnail`

---

# Moderation & Safety (No Login Version)

Since there’s **no accounts/roles**, you’ll want guardrails:

### Required guardrails (MVP)

* Display name guidance: “First name or nickname only”
* Upload rules + checkbox: “No personal info”
* Profanity filter for title/description (basic)
* Rate limits / spam protection:

  * CAPTCHA on upload (recommended)
  * per-IP upload limits
* Reporting:

  * “Report this project” form
  * stores to a `reports` table (even without login)

### Content handling without login

* No editing/deleting unless you add:

  * a “secret edit link” token per post, shown once after upload, OR
  * admin-only moderation later (even if not in MVP)

---

# MVP Feature List (Shippable)

* Gallery browse + search + belt filter
* Project detail page with share link
* Upload flow with validation
* Supabase storage + database
* Background conversion pipeline + status updates
* Basic spam protection
* Simple “Report” form

---

# Nice-to-have (Phase 2)

* Featured carousel + “Sensei Picks” (still possible without accounts if you set featured in DB manually)
* “Most viewed” sorting
* Tagging (platformer, shooter, etc.)
* Thumbnails generation for faster gallery loading
* QR code share on project page
* Secret edit link tokens

---

# Tech Notes (React + Next.js)

* Next.js App Router + API routes (or server actions) for upload
* Realtime updates:

  * Supabase Realtime to auto-update status from `processing → ready`
  * or simple polling on the project detail page

---

If you want, I can also write:

* the **exact DB schema SQL** (projects + reports),
* the **edge function responsibilities** (what each does),
* and the **upload + processing UX copy** so it feels Code Ninjas-friendly.
