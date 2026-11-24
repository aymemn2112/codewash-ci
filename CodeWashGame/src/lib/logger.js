/**
 * Minimal leveled logger.
 *
 * `warn` and `error` always surface (they matter in production).
 * `debug`/`log`/`info` are gated to development to keep the browser console quiet.
 */

const isDev = Boolean(import.meta.env?.DEV);

const silent = () => {};

const bind = (method) => (isDev ? (...args) => console[method](...args) : silent);

export const logger = {
    debug: bind('debug'),
    log: bind('log'),
    info: bind('info'),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
};

export default logger;
