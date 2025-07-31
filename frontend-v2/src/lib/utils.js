import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getLanguageId = language => {
  // Convert the incoming language string to uppercase to ensure a match
  const upperCaseLanguage = language.toUpperCase();

  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63
    // Add other languages here
  };

  return languageMap[upperCaseLanguage];
};

// export const getLanguageName = languageId => {
//   const LANGUAGE_NAMES = {
//     74: 'TypeScript',
//     63: 'JavaScript',
//     71: 'Python',
//     62: 'Java'
//   };

//   return LANGUAGE_NAMES[languageId] || 'Unknown';
// };
