import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** el cliente del panel; nulo si faltan las dos variables del proyecto */
export const supabase =
  url && clave
    ? createClient(url, clave, { auth: { persistSession: true } })
    : null;
