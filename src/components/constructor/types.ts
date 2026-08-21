// ============================================================================
// gifty.by · Конструктор · Типы данных (система «зон печати» / Print Zones)
// Все координаты и размеры зон — В ПРОЦЕНТАХ от ширины/высоты мокапа (0–100),
// чтобы превью адаптивно масштабировалось (мобильный-first).
// ============================================================================

/** Тип контента зоны. */
export type PrintZoneType = 'image' | 'text';

/** Одна зона печати — прямоугольник на мокапе + тип контента. */
export interface PrintZone {
  /** Уникальный id зоны (ключ для React и идентификатор в DesignJSON). */
  id: string;
  /** Что в зоне: картинка или текст. */
  type: PrintZoneType;
  /** Левый край зоны, % ширины мокапа. */
  x: number;
  /** Верхний край зоны, % высоты мокапа. */
  y: number;
  /** Ширина зоны, % ширины мокапа. */
  width: number;
  /** Высота зоны, % высоты мокапа. */
  height: number;

  // --- только для type === 'text' ---
  /** Плейсхолдер / стартовое значение текста. */
  defaultText?: string;
  /** Максимум независимых текстовых блоков в зоне (по умолчанию 1). */
  maxLines?: number;
  /** Подмножество доступных шрифтов (по умолчанию Rubik/Mono/Cursive). */
  allowedFonts?: string[];

  // --- только для type === 'image' ---
  /** Ожидаемое соотношение сторон (ширина/высота) — подсказка для загрузки. */
  aspectRatio?: number;
}

/** Конфиг товара: фон мокапа + массив зон. */
export interface ConstructorConfig {
  /** id варианта товара (product_variants.id). */
  id: string;
  /** Тип товара ('mug' | 'poster' | ...) — только для подписей/отладки. */
  productType: string;
  /** Фон мокапа (из product_variants.mockup_url). */
  mockupUrl: string;
  /** Массив зон печати — единственное, что определяет конструктор. */
  zones: PrintZone[];
}

/** Один текстовый блок («строка» со своим форматированием). */
export interface TextLine {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
}

/** Заполненное значение одной зоны — то, что попадает в design_json. */
export interface ZoneValue {
  zoneId: string;
  type: PrintZoneType;
  /** dataURL / URL загруженной картинки (для image-зон). */
  imageUrl?: string;
  /** Блоки текста (для text-зон). */
  textLines?: TextLine[];
}

/** Итоговая структура дизайна — сохраняется в order_items.design_json (jsonb). */
export interface DesignJSON {
  configId: string;
  productType: string;
  mockupUrl: string;
  zones: ZoneValue[];
}
