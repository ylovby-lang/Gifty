// ============================================================================
// gifty.by · Конструктор · Макеты «развёртки» кружки (система «зон печати»)
//
// Физическая зона печати кружки: 200 мм × 95 мм → соотношение 21:10.
// Все координаты/размеры зон — В ПРОЦЕНТАХ от плоского белого листа (0–100).
// mockupUrl всегда '' — реальный URL приходит пропом из Supabase и используется
// только как статичная картинка товара в правой колонке (не фон превью).
// ============================================================================
import type { ConstructorConfig } from './types';

/** Макет 1 — «Всё фото»: одна зона-картинка на всю площадь развёртки. */
const FULL_PHOTO: ConstructorConfig = {
  id: 'full-photo',
  label: 'Всё фото',
  productType: 'mug',
  mockupUrl: '',
  zones: [
    { id: 'full-photo-img', type: 'image', x: 0, y: 0, width: 100, height: 100 },
  ],
};

/** Макет 2 — «Текст + Фото»: текст слева (30%), фото справа (68%). */
const TEXT_PHOTO: ConstructorConfig = {
  id: 'text-photo',
  label: 'Текст + Фото',
  productType: 'mug',
  mockupUrl: '',
  zones: [
    {
      id: 'text-photo-text',
      type: 'text',
      x: 0,
      y: 0,
      width: 30,
      height: 100,
      defaultText: 'Текст',
      maxLines: 4,
    },
    {
      id: 'text-photo-img',
      type: 'image',
      x: 32,
      y: 0,
      width: 68,
      height: 100,
    },
  ],
};

/** Макет 3 — «Текст + Фото + Текст»: текст/фото/текст (25/46/25). */
const TEXT_PHOTO_TEXT: ConstructorConfig = {
  id: 'text-photo-text',
  label: 'Текст + Фото + Текст',
  productType: 'mug',
  mockupUrl: '',
  zones: [
    {
      id: 'tpt-text-1',
      type: 'text',
      x: 0,
      y: 0,
      width: 25,
      height: 100,
      defaultText: 'Текст',
      maxLines: 3,
    },
    {
      id: 'tpt-img',
      type: 'image',
      x: 27,
      y: 0,
      width: 46,
      height: 100,
    },
    {
      id: 'tpt-text-2',
      type: 'text',
      x: 75,
      y: 0,
      width: 25,
      height: 100,
      defaultText: 'Текст',
      maxLines: 3,
    },
  ],
};

/** Макет 4 — «Заголовок + Текст + Сетка 2×2»: два текста сверху, 4 фото внизу. */
const TITLE_TEXT_GRID: ConstructorConfig = {
  id: 'title-text-grid-2x2',
  label: 'Заголовок + Текст + Сетка 2×2',
  productType: 'mug',
  mockupUrl: '',
  zones: [
    {
      id: 'ttg-title',
      type: 'text',
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      defaultText: 'Заголовок',
      maxLines: 2,
    },
    {
      id: 'ttg-subtitle',
      type: 'text',
      x: 0,
      y: 22,
      width: 100,
      height: 15,
      defaultText: 'Подзаголовок',
      maxLines: 2,
    },
    { id: 'ttg-img-1', type: 'image', x: 0, y: 40, width: 50, height: 30 },
    { id: 'ttg-img-2', type: 'image', x: 50, y: 40, width: 50, height: 30 },
    { id: 'ttg-img-3', type: 'image', x: 0, y: 70, width: 50, height: 30 },
    { id: 'ttg-img-4', type: 'image', x: 50, y: 70, width: 50, height: 30 },
  ],
};

/** Макет 5 — «Сетка 6 фото (2×3)»: 6 фото, 2 ряда × 3 колонки на всю площадь. */
const GRID_6: ConstructorConfig = {
  id: 'grid-6',
  label: 'Сетка 6 фото (2×3)',
  productType: 'mug',
  mockupUrl: '',
  zones: [
    { id: 'g6-1', type: 'image', x: 0, y: 0, width: 33.33, height: 50 },
    { id: 'g6-2', type: 'image', x: 33.33, y: 0, width: 33.33, height: 50 },
    { id: 'g6-3', type: 'image', x: 66.66, y: 0, width: 33.33, height: 50 },
    { id: 'g6-4', type: 'image', x: 0, y: 50, width: 33.33, height: 50 },
    { id: 'g6-5', type: 'image', x: 33.33, y: 50, width: 33.33, height: 50 },
    { id: 'g6-6', type: 'image', x: 66.66, y: 50, width: 33.33, height: 50 },
  ],
};

/** Все доступные макеты «развёртки» — источник выпадающего списка «Выбор макета». */
export const MVP_CONFIGS: ConstructorConfig[] = [
  FULL_PHOTO,
  TEXT_PHOTO,
  TEXT_PHOTO_TEXT,
  TITLE_TEXT_GRID,
  GRID_6,
];
