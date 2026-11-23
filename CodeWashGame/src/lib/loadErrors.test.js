import { describe, it, expect, afterEach } from 'vitest';
import { recordLoadError, getLoadErrors, consumeLoadErrors, resetLoadErrors } from './loadErrors';

afterEach(() => {
    resetLoadErrors();
});

describe('loadErrors', () => {
    it('collects error sources', () => {
        recordLoadError('skills');
        recordLoadError('stats');
        expect(getLoadErrors()).toEqual(['skills', 'stats']);
    });

    it('consumes and clears the buffer', () => {
        recordLoadError('theme');
        expect(consumeLoadErrors()).toEqual(['theme']);
        expect(getLoadErrors()).toEqual([]);
    });
});
