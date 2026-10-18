// Lectura segura de traducciones: t() devuelve lo que diga el JSON, así que cada helper
// valida la forma en runtime y degrada (key, [] o null) en vez de romper el render.

export type TranslateOptions = Record<string, unknown>;

// Subconjunto de TFunction que usan los helpers; permite pasar el `t` de useTranslation tal cual
export type Translate = (key: string, options?: TranslateOptions) => unknown;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isString = (value: unknown): value is string => typeof value === "string";

export const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

/** Texto simple. Si la clave no resuelve a un string devuelve la propia clave (igual que i18next al faltar). */
export function tText(t: Translate, key: string, options?: TranslateOptions): string {
  const value = t(key, options);
  return isString(value) ? value : key;
}

/** Lista de elementos validados por `guard`. Devuelve [] si falta la clave o algún elemento no cumple. */
export function tList<T>(
  t: Translate,
  key: string,
  guard: (item: unknown) => item is T,
  options?: TranslateOptions
): T[] {
  const value = t(key, { ...options, returnObjects: true });
  return Array.isArray(value) && value.every(guard) ? value : [];
}

/** Lista de textos. Devuelve [] si no es un arreglo de strings. */
export const tArray = (t: Translate, key: string, options?: TranslateOptions): string[] =>
  tList(t, key, isString, options);

/** Objeto validado por `guard`. Devuelve null si falta la clave o no cumple. */
export function tObject<T>(
  t: Translate,
  key: string,
  guard: (value: unknown) => value is T,
  options?: TranslateOptions
): T | null {
  const value = t(key, { ...options, returnObjects: true });
  return guard(value) ? value : null;
}
