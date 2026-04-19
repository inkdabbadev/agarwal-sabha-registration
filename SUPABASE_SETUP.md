# Supabase Setup

1. Create a table by running [supabase/001_create_ag_registrations.sql](C:/Users/ashwi/Documents/Project/INKDABBA/AGARWAL-SHABHA/supabase/001_create_ag_registrations.sql:1) in the Supabase SQL editor.
2. If you already created the table earlier, run [supabase/002_harden_ag_registrations.sql](C:/Users/ashwi/Documents/Project/INKDABBA/AGARWAL-SHABHA/supabase/002_harden_ag_registrations.sql:1) once to add the stricter validation checks.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL`
5. Start the app with `npm run dev`.

Current table name:
- `public.ag_registrations`

Current fields:
- `full_name`
- `mobile_number`
- `email`

If you want a different table name like `AG_User`, the SQL and frontend can be renamed easily.
