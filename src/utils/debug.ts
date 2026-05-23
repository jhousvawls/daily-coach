/**
 * Debug logging utility
 * Only logs in development mode to keep production console clean
 */
const isDev = import.meta.env.DEV;

export const debug = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
};
