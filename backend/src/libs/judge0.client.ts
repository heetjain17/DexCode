export const LANGUAGE_MAP = {
  PYTHON: 71,
  JAVA: 62,
  JAVASCRIPT: 63,
} as const;

export type LanguageKey = keyof typeof LANGUAGE_MAP;

export const getLanguageId = (language: LanguageKey): number =>
  LANGUAGE_MAP[language];

export const getLanguageName = (id: number): string => {
  const map: Record<number, string> = {
    71: 'Python',
    62: 'Java',
    63: 'JavaScript',
  };
  return map[id] ?? 'Unknown';
};
