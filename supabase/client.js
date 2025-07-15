// Aquí irá la conexión con Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqdoiwvfsaetoqcduvpp.supabase.co'; // <- URL sin salto de línea
const supabaseKey = 'sb_publishable_pBQevuycbmUky_8z8XcsNA_9awVu31_'; // <- tu Public API Key

export const supabase = createClient(supabaseUrl, supabaseKey);
