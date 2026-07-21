import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pohmgskjludcnpfsyrsr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7ORZDXf-IHv4Wgw5rkN31Q_i5IVyEUd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
