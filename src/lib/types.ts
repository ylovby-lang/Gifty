// ============================================================================
// gifty.by · Общие типы слоя данных (таблицы Supabase)
// Здесь только типы строк БД. Типы зон конструктора лежат в
// src/components/constructor/types.ts — НЕ дублируем их сюда.
// ============================================================================

/** Строка таблицы product_variants — вариант товара («Белая кружка» и т.п.). */
export interface ProductVariant {
  id: string;
  product_id: string;
  /** Название варианта (например, «Белая классическая»). */
  name: string;
  /** Ссылка на мокап товара (публичный бакет product-images). */
  mockup_url: string;
  /** Alt по-русски для SEO (может отсутствовать). */
  mockup_alt: string | null;
  is_active: boolean;
  created_at: string;
}
