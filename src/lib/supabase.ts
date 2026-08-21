// ============================================================================
// gifty.by · Supabase-клиент (заглушка)
// Читает публичные env-переменные из process.env. Реальные URL и ключи здесь
// НЕ хардкодятся — они задаются в .env.local (на сервере и локально).
// Если переменных нет, модуль бросает понятную ошибку.
// ============================================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase не настроен — добавьте env-переменные Supabase: NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

/** Единый клиент Supabase на всё приложение. */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export { createClient };
