// ============================================================================
// gifty.by · Главная страница — конструктор зон печати
//
// СЕРВЕРНЫЙ компонент (async, без 'use client'). На этапе 3 подтягивает
// mockup_url тестового варианта из Supabase (product_variants) и передаёт
// его как простой строковый проп в клиентский UniversalConstructor.
// ============================================================================
import { Rubik } from "next/font/google";
import UniversalConstructor from "@/components/constructor";
import { supabase } from "@/lib/supabase";
import type { ProductVariant } from "@/lib/types";

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
});

// Запрос к Supabase выполняется при каждом запросе страницы (runtime),
// а не на этапе сборки — мокап всегда актуальный из БД.
export const dynamic = "force-dynamic";

/** Тестовый вариант (Этап 3): id варианта «Белая классическая».
    Пока это тестовый этап — UUID варианта можно захардкодить как константу.
    URL картинки в код НЕ хардкодится — он приходит из БД (mockup_url). */
const TEST_VARIANT_ID = "ffe087f0-b8d7-47cf-b3a6-fce196bff0f6";

export default async function Home() {
  // Результат запроса: либо mockup_url, либо понятный текст ошибки для UI.
  let mockupUrl: string | null = null;
  let userError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("id", TEST_VARIANT_ID)
      .single();

    if (error) {
      userError = "Не удалось загрузить товар";
    } else if (!data) {
      userError = "Товар не найден";
    } else {
      mockupUrl = (data as ProductVariant).mockup_url ?? null;
    }
  } catch {
    userError = "Не удалось загрузить товар";
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-[#F7F3EC] px-4 py-10 text-[#1E1B16]">
      <div className={`w-full max-w-4xl ${rubik.className}`}>
        <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
          Конструктор зон печати · gifty.by
        </h1>
        <p className="mb-6 text-[13px] text-[#7A7264]">
          Демо движка «слоёный пирог»: чистый DOM/CSS. Переключите товар —
          движок тот же, меняется только конфиг зон.
        </p>

        {userError ? (
          <div className="rounded-2xl border-2 border-[#E4DCCE] bg-[#FFFDF8] px-6 py-10 text-center text-[#7A7264]">
            {userError}
          </div>
        ) : (
          <UniversalConstructor mockupUrl={mockupUrl} />
        )}
      </div>
    </main>
  );
}
