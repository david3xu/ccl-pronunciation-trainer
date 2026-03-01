/**
 * Centralized Logger
 *
 * Wraps console methods so logging can be disabled in production builds.
 * In development (`import.meta.env.DEV`), all levels print.
 * In production, only warn and error print.
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

function noop(..._args: unknown[]): void {
  // intentionally empty
}

export const logger = {
  log: isDev ? console.log.bind(console) : noop,
  debug: isDev ? console.debug.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
  warn: console.warn.bind(console),
  error: console.error.bind(console),
} as const;

export default logger;
