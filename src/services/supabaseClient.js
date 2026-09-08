import { createClient } from '@supabase/supabase-js'

/**
 * If VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren't set (e.g. you haven't
 * created a .env yet), `supabase` is null and dataService.js automatically
 * falls back to mock data. Nothing else needs to change — just add the two
 * env vars and it starts hitting the real database.
 */
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

if (!supabase && import.meta.env?.DEV) {
  console.info(
    '[Pipeline HQ] Supabase env vars not set — running on mock data. ' +
      'See README.md → "Connect Supabase" to wire up a real database.'
  )
}
