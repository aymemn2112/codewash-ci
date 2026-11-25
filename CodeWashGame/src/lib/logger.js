/**
 * Minimal leveled logger.
 *
 * Every call is also recorded in a small ring buffer (`logBuffer`) so a bug
 * report can include recent errors/warnings.
 *
 * `warn` and `error` always surface (they matter in production).
 * `debug`/`log`/`info` are gated to development to keep the console quiet.
 */
import { addLogEntry } from './logBuffer';

const isDev = Boolean(import.meta.env?.DEV);

const silent = () => {};

const recordAndWrite =
    (level, method) =>
    (...args) => {
        addLogEntry(level, args);
        console[method](...args);
    };

const devOnly = (level, method) =>
    isDev
        ? (...args) => {
              addLogEntry(level, args);
              console[method](...args);
          }
        : silent;

export const logger = {
    debug: devOnly('debug', 'debug'),
    log: devOnly('log', 'log'),
    info: devOnly('info', 'info'),
    warn: recordAndWrite('warn', 'warn'),
    error: recordAndWrite('error', 'error'),
};

export default logger;
