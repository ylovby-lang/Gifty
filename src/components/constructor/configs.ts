// ============================================================================
// gifty.by · Конструктор · MVP-конфиги (система «зон печати»)
// Компонент НЕ знает про «кружку»/«постер» — только массив зон.
// Все координаты/размеры зон — В ПРОЦЕНТАХ от мокапа (0–100).
// ============================================================================
import type { ConstructorConfig } from './types';

/** «Белая кружка» — одна зона-картинка (центральная печатная область). */
export const MUG_CONFIG: ConstructorConfig = {
  id: 'mug-white',
  productType: 'mug',
  mockupUrl: '', // реальный мокап подставим позже; пока превью — белый div
  zones: [
    {
      id: 'mug-print',
      type: 'image',
      x: 30,
      y: 30,
      width: 40,
      height: 40,
      aspectRatio: 1,
    },
  ],
};

/** «Постер А4» — три зоны: текст-заголовок, картинка, текст-подпись. */
export const POSTER_CONFIG: ConstructorConfig = {
  id: 'poster-a4',
  productType: 'poster',
  mockupUrl: '',
  zones: [
    {
      id: 'poster-title',
      type: 'text',
      x: 8,
      y: 6,
      width: 84,
      height: 14,
      defaultText: 'Поздравляю!',
      maxLines: 2,
    },
    {
      id: 'poster-image',
      type: 'image',
      x: 12,
      y: 24,
      width: 76,
      height: 52,
      aspectRatio: 1.4,
    },
    {
      id: 'poster-caption',
      type: 'text',
      x: 8,
      y: 80,
      width: 84,
      height: 14,
      defaultText: 'С любовью',
      maxLines: 2,
    },
  ],
};

/** Все доступные конфиги — источник переключателя в компоненте. */
export const MVP_CONFIGS: ConstructorConfig[] = [MUG_CONFIG, POSTER_CONFIG];
