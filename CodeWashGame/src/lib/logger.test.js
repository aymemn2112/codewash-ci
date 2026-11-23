import { describe, it, expect, vi, afterEach } from 'vitest';
import { logger } from './logger';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('logger', () => {
    it('always forwards warnings', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        logger.warn('careful', 42);
        expect(spy).toHaveBeenCalledWith('careful', 42);
    });

    it('always forwards errors', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        logger.error('boom');
        expect(spy).toHaveBeenCalledWith('boom');
    });

    it('forwards debug in development (DEV is true under Vitest)', () => {
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        logger.debug('noise');
        expect(spy).toHaveBeenCalledWith('noise');
    });
});
