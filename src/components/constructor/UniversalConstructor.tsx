'use client';

// ============================================================================
// gifty.by · UniversalConstructor — универсальный конструктор «зон печати»
//
// Превью — ТОЛЬКО DOM/CSS («слоёный пирог»). Canvas/Fabric/Konva/html2canvas
// ЗАПРЕЩЕНЫ (Конституция §5).
//
// Двухколоночный макет:
//   • ЛЕВАЯ колонка — рабочая область «Развёртка»: большой БЕЛЫЙ прямоугольник
//     с лёгкой серой рамкой (border-[#E4DCCE]) и строгой пропорцией 21:10
//     (200×95 мм). Внутри него по position:absolute (в %) рендерятся зоны.
//   • ПРАВАЯ колонка — статичная картинка мокапа (проп mockupUrl, без зон),
//     выпадающий список «Выбор макета» и форма загрузки/правки зон.
//
// Движок не знает про конкретный товар — только массив zones из конфига.
// DesignJSON собирается ТОЛЬКО по клику на «Посмотреть JSON» (модалка поверх
// интерфейса); ввод текста обновляет только превью и НЕ пересобирает JSON.
// ============================================================================
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ForwardedRef,
} from 'react';
import type {
  ConstructorConfig,
  DesignJSON,
  PrintZone,
  TextLine,
  ZoneValue,
} from './types';
import { MVP_CONFIGS } from './configs';

const DEFAULT_FONTS = ['Rubik', 'Mono', 'Cursive'];

/** Пределы загрузки изображений (для image-зон). */
const MAX_FILE_BYTES = 50 * 1024 * 1024; // максимум 50 МБ
const MIN_PRINT_WIDTH = 2362; // 200 мм при 300 dpi
const MIN_PRINT_HEIGHT = 1122; // 95 мм при 300 dpi
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.tiff,.tif';

/** Сообщение валидации загрузки конкретной image-зоны. */
type ImageMessage = { kind: 'error' | 'warning'; text: string } | null;

/** CSS-стеки для живого превью: логические имена шрифтов → реальные семейства.
    next/font подключает Rubik под хэш-именем, поэтому в превью используем
    переменную --font-rubik. В DesignJSON сохраняются логические имена. */
const FONT_STACKS: Record<string, string> = {
  Rubik: 'var(--font-rubik), Rubik, system-ui, sans-serif',
  Mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  Cursive: 'cursive',
};

export interface UniversalConstructorHandle {
  /** Текущий DesignJSON — уйдёт в order_items.design_json (jsonb). */
  getDesignJSON: () => DesignJSON;
}

export interface UniversalConstructorProps {
  configs?: ConstructorConfig[];
  initialConfigId?: string;
  initialDesign?: DesignJSON | null;
  onChange?: (design: DesignJSON) => void;
  /** Статичная картинка мокапа товара (product_variants.mockup_url) — только правая колонка. */
  mockupUrl?: string | null;
}

/** Строит стартовые значения зон из конфига (с учётом сохранённого дизайна). */
function buildInitialValues(
  config: ConstructorConfig,
  initialDesign?: DesignJSON | null,
): Record<string, ZoneValue> {
  const map: Record<string, ZoneValue> = {};
  const restored = new Map<string, ZoneValue>(
    (initialDesign?.zones ?? []).map((z) => [z.zoneId, z]),
  );
  for (const zone of config.zones) {
    if (zone.type === 'image') {
      map[zone.id] = {
        zoneId: zone.id,
        type: 'image',
        imageUrl: restored.get(zone.id)?.imageUrl,
      };
    } else {
      const prev = restored.get(zone.id);
      const lines: TextLine[] =
        prev?.textLines && prev.textLines.length > 0
          ? prev.textLines
          : [
              {
                text: zone.defaultText ?? '',
                fontFamily: zone.allowedFonts?.[0] ?? 'Rubik',
                fontSize: 24,
                color: '#1E1B16',
              },
            ];
      map[zone.id] = { zoneId: zone.id, type: 'text', textLines: lines };
    }
  }
  return map;
}

function UniversalConstructor(
  {
    configs = MVP_CONFIGS,
    initialConfigId,
    initialDesign,
    onChange,
    mockupUrl,
  }: UniversalConstructorProps,
  ref: ForwardedRef<UniversalConstructorHandle>,
) {
  const [activeId, setActiveId] = useState(
    initialConfigId ?? configs[0]?.id ?? '',
  );
  const config = configs.find((c) => c.id === activeId) ?? configs[0];

  const [values, setValues] = useState<Record<string, ZoneValue>>(() =>
    buildInitialValues(config, initialDesign),
  );

  // --- Сообщения валидации загрузки (по одной на каждую image-зону) ---
  const [imageMsgs, setImageMsgs] = useState<Record<string, ImageMessage>>({});

  // --- Состояние модалки DesignJSON (собирается только по клику) ---
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const setImageMsg = useCallback((zoneId: string, msg: ImageMessage) => {
    setImageMsgs((prev) => ({ ...prev, [zoneId]: msg }));
  }, []);

  const switchConfig = useCallback(
    (id: string) => {
      const next = configs.find((c) => c.id === id);
      if (!next) return;
      setActiveId(id);
      setValues(buildInitialValues(next, null));
      setImageMsgs({}); // при смене макета сбрасываем сообщения валидации
    },
    [configs],
  );

  const buildDesign = useCallback((): DesignJSON => {
    return {
      configId: config.id,
      productType: config.productType,
      mockupUrl: config.mockupUrl,
      zones: config.zones
        .map((z) => values[z.id])
        .filter((v): v is ZoneValue => Boolean(v))
        .map((v) =>
          v.type === 'image'
            ? { ...v, textLines: undefined }
            : { ...v, imageUrl: undefined },
        ),
    };
  }, [config, values]);

  useImperativeHandle(ref, () => ({ getDesignJSON: buildDesign }), [buildDesign]);

  const commit = useCallback(
    (next: Record<string, ZoneValue>) => {
      setValues(next);
      onChange?.({
        configId: config.id,
        productType: config.productType,
        mockupUrl: config.mockupUrl,
        zones: config.zones
          .map((z) => next[z.id])
          .filter((v): v is ZoneValue => Boolean(v)),
      });
    },
    [config, onChange],
  );

  const setImage = useCallback(
    (zoneId: string, imageUrl: string | undefined) =>
      commit({ ...values, [zoneId]: { zoneId, type: 'image', imageUrl } }),
    [values, commit],
  );

  const updateLine = useCallback(
    (zoneId: string, index: number, patch: Partial<TextLine>) => {
      const zone = values[zoneId];
      if (!zone || zone.type !== 'text') return;
      const lines = [...(zone.textLines ?? [])];
      lines[index] = { ...lines[index], ...patch };
      commit({
        ...values,
        [zoneId]: { zoneId, type: 'text', textLines: lines },
      });
    },
    [values, commit],
  );

  const addLine = useCallback(
    (zoneId: string, zone: PrintZone) => {
      const cur = values[zoneId];
      const curLines = cur?.type === 'text' ? (cur.textLines ?? []) : [];
      commit({
        ...values,
        [zoneId]: {
          zoneId,
          type: 'text',
          textLines: [
            ...curLines,
            {
              text: '',
              fontFamily: zone.allowedFonts?.[0] ?? 'Rubik',
              fontSize: 24,
              color: '#1E1B16',
            },
          ],
        },
      });
    },
    [values, commit],
  );

  const removeLine = useCallback(
    (zoneId: string, index: number) => {
      const zone = values[zoneId];
      if (!zone || zone.type !== 'text') return;
      const lines = (zone.textLines ?? []).filter((_, i) => i !== index);
      commit({
        ...values,
        [zoneId]: { zoneId, type: 'text', textLines: lines },
      });
    },
    [values, commit],
  );

  // --- Строгая валидация загрузки изображения (для image-зон) ---
  const onUpload = useCallback(
    (zoneId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 1) Размер: максимум 50 МБ. Больше — красная ошибка, файл НЕ загружается.
      if (file.size > MAX_FILE_BYTES) {
        setImageMsg(zoneId, { kind: 'error', text: 'Файл слишком большой' });
        e.target.value = '';
        return;
      }

      // 2) Читаем файл в dataURL и проверяем разрешение через временный Image().
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        const probe = new Image();
        probe.onload = () => {
          if (
            probe.naturalWidth < MIN_PRINT_WIDTH ||
            probe.naturalHeight < MIN_PRINT_HEIGHT
          ) {
            // Разрешение низкое — оранжевое предупреждение, файл ЗАГРУЖАЕТСЯ.
            setImageMsg(zoneId, {
              kind: 'warning',
              text: '⚠️ Разрешение низкое, печать может быть размытой!',
            });
          } else {
            setImageMsg(zoneId, null);
          }
          setImage(zoneId, dataUrl);
        };
        probe.onerror = () => {
          setImageMsg(zoneId, {
            kind: 'error',
            text: 'Не удалось прочитать изображение',
          });
        };
        probe.src = dataUrl;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [setImage, setImageMsg],
  );

  // --- Открытие модалки: JSON собирается строго в момент клика ---
  const openJsonModal = useCallback(() => {
    setJsonText(JSON.stringify(buildDesign(), null, 2));
    setJsonOpen(true);
  }, [buildDesign]);

  const closeJsonModal = useCallback(() => setJsonOpen(false), []);

  const fontsFor = (zone: PrintZone) => zone.allowedFonts ?? DEFAULT_FONTS;

  return (
    <div className="flex flex-col gap-6 text-[#1E1B16]">
      {/* ===== Двухколоночный макет: слева «Развёртка», справа настройки ===== */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ===== ЛЕВАЯ колонка — рабочая область «Развёртка» ===== */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-bold">Развёртка</h2>
            <span className="text-[12px] text-[#7A7264]">200 × 95 мм · 21:10</span>
          </div>

          {/* Плоский белый лист: всегда белый, без фона-мокапа. */}
          <div className="relative aspect-[21/10] w-full overflow-hidden rounded-lg border border-[#E4DCCE] bg-white">
            {config.zones.map((zone) => {
              const v = values[zone.id];
              if (!v) return null;
              const box: CSSProperties = {
                position: 'absolute',
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              };
              if (v.type === 'image') {
                return (
                  <div
                    key={zone.id}
                    style={box}
                    className="flex items-center justify-center overflow-hidden outline-dashed outline-1 outline-[#F5C93C]"
                  >
                    {v.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.imageUrl}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="px-1 text-center text-[11px] text-[#7A7264]">
                        Зона печати
                      </span>
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={zone.id}
                  style={box}
                  className="flex flex-col items-center justify-center gap-0.5 overflow-hidden outline-dashed outline-1 outline-[#F5C93C]"
                >
                  {(v.textLines ?? []).map((line, i) => (
                    <span
                      key={i}
                      className="max-w-full break-words text-center"
                      style={{
                        fontFamily:
                          FONT_STACKS[line.fontFamily] ?? line.fontFamily,
                        fontSize: line.fontSize,
                        color: line.color,
                        lineHeight: 1.2,
                      }}
                    >
                      {line.text || ' '}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== ПРАВАЯ колонка — настройки ===== */}
        <div className="flex w-full flex-col gap-4 lg:w-[380px] lg:flex-shrink-0">
          {/* Статичная картинка мокапа (только для понимания товара, без зон). */}
          <section className="rounded-2xl border-2 border-[#E4DCCE] bg-[#FFFDF8] p-3">
            <div className="mb-2 text-[13px] font-bold">Товар</div>
            {mockupUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mockupUrl}
                alt="Мокап товара"
                className="h-44 w-full rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-44 w-full items-center justify-center rounded-xl bg-[#F7F3EC] text-[13px] text-[#7A7264]">
                Мокап не загружен
              </div>
            )}
          </section>

          {/* Выпадающий список «Выбор макета» (заменяет прежний переключатель). */}
          <section className="rounded-2xl border-2 border-[#E4DCCE] bg-[#FFFDF8] p-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold">Выбор макета</span>
              <select
                value={activeId}
                onChange={(e) => switchConfig(e.target.value)}
                className="w-full rounded-xl border-2 border-[#1E1B16] bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[#F5C93C]"
              >
                {configs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label ?? c.id}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* ===== Форма ввода зон (логика прежняя, перенесена в правую колонку) ===== */}
          <div className="flex flex-col gap-3">
            {config.zones.map((zone) => {
              const v = values[zone.id];
              if (!v) return null;
              return (
                <section
                  key={zone.id}
                  className="rounded-xl border border-[#E4DCCE] bg-[#FFFDF8] p-3"
                >
                  <div className="mb-2 text-[13px] font-bold">
                    {zone.type === 'image' ? '🖼 Картинка' : '🔤 Текст'} ·{' '}
                    <span className="text-[#7A7264]">{zone.id}</span>
                  </div>

                  {zone.type === 'image' ? (
                    <div className="flex flex-col gap-2">
                      {v.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.imageUrl}
                          alt=""
                          className="h-16 w-16 rounded-lg border border-[#E4DCCE] object-contain"
                        />
                      ) : null}
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#1E1B16] bg-[#F5C93C] px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#1E1B16] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
                        {/* Иконка загрузки (inline SVG). */}
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 3v12" />
                          <path d="m7 8 5-5 5 5" />
                          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                        </svg>
                        {v.imageUrl ? 'Заменить картинку' : 'Загрузить'}
                        <input
                          type="file"
                          accept={IMAGE_ACCEPT}
                          onChange={onUpload(zone.id)}
                          className="hidden"
                        />
                      </label>
                      {imageMsgs[zone.id] ? (
                        <p
                          className={
                            imageMsgs[zone.id]!.kind === 'error'
                              ? 'text-[13px] font-bold text-[#B3392B]'
                              : 'text-[13px] font-bold text-orange-600'
                          }
                        >
                          {imageMsgs[zone.id]!.text}
                        </p>
                      ) : null}
                      {v.imageUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            setImage(zone.id, undefined);
                            setImageMsg(zone.id, null);
                          }}
                          className="self-start bg-transparent p-0 text-[13px] text-[#B3392B]"
                        >
                          Убрать картинку
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(v.textLines ?? []).map((line, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-2 rounded-lg border border-[#E4DCCE] p-2"
                        >
                          <input
                            type="text"
                            value={line.text}
                            placeholder={zone.defaultText ?? 'Текст'}
                            onChange={(e) =>
                              updateLine(zone.id, i, { text: e.target.value })
                            }
                            className="rounded-lg border border-[#E4DCCE] px-3 py-2 text-sm outline-none focus:border-[#F5C93C]"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={line.fontFamily}
                              onChange={(e) =>
                                updateLine(zone.id, i, {
                                  fontFamily: e.target.value,
                                })
                              }
                              className="rounded-lg border border-[#E4DCCE] px-2 py-1 text-sm"
                            >
                              {fontsFor(zone).map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
                            </select>
                            <input
                              type="range"
                              min={10}
                              max={64}
                              value={line.fontSize}
                              onChange={(e) =>
                                updateLine(zone.id, i, {
                                  fontSize: Number(e.target.value),
                                })
                              }
                              className="flex-1"
                            />
                            <span className="min-w-[32px] text-[12px] text-[#7A7264]">
                              {line.fontSize}px
                            </span>
                            <input
                              type="color"
                              value={line.color}
                              onChange={(e) =>
                                updateLine(zone.id, i, {
                                  color: e.target.value,
                                })
                              }
                              className="h-[30px] w-[34px] cursor-pointer border-0 bg-transparent p-0"
                            />
                            <button
                              type="button"
                              onClick={() => removeLine(zone.id, i)}
                              disabled={(v.textLines ?? []).length <= 1}
                              className="ml-auto bg-transparent p-0 text-lg leading-none text-[#B3392B] disabled:opacity-30"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {(v.textLines ?? []).length < (zone.maxLines ?? 10) && (
                        <button
                          type="button"
                          onClick={() => addLine(zone.id, zone)}
                          className="rounded-xl border border-dashed border-[#E4DCCE] bg-[#F7F3EC] px-3 py-2 text-sm font-bold"
                        >
                          + Добавить строку
                        </button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Кнопка вывода DesignJSON ===== */}
      <div>
        <button
          type="button"
          onClick={openJsonModal}
          className="rounded-xl border-2 border-[#1E1B16] bg-[#F5C93C] px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#1E1B16]"
        >
          Посмотреть JSON
        </button>
      </div>

      {/* ===== Модалка DesignJSON (поверх интерфейса) ===== */}
      {jsonOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B16]/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="json-modal-title"
          onClick={closeJsonModal}
        >
          <div
            className="flex max-h-[82vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border-2 border-[#1E1B16] bg-[#FFFDF8] shadow-[6px_6px_0_#1E1B16]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#E4DCCE] px-4 py-3">
              <span id="json-modal-title" className="text-[15px] font-bold">
                DesignJSON
              </span>
              <button
                type="button"
                onClick={closeJsonModal}
                aria-label="Закрыть"
                className="bg-transparent p-0 text-lg leading-none text-[#B3392B]"
              >
                ×
              </button>
            </div>
            <pre className="m-0 max-h-[calc(82vh-62px)] overflow-auto whitespace-pre-wrap break-all rounded-none bg-[#1E1B16] p-4 text-[12px] leading-relaxed text-[#F7F3EC]">
              {jsonText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(UniversalConstructor);
