import { createClient } from "@supabase/supabase-js"

export default createClient(process.env.SUPABASE_ENDPOINT!, process.env.SUPABASE_API_KEY!)
