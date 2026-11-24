import { afterEach, describe, expect, it } from 'vitest';
import { browserStorage } from './storage';

afterEach(() => localStorage.clear());

describe('browserStorage', () => {
    it('writes, reads and removes through localStorage', () => {
        browserStorage.setItem('storage_service_test', 'value');
        expect(localStorage.getItem('storage_service_test')).toBe('value');
        expect(browserStorage.getItem('storage_service_test')).toBe('value');

        browserStorage.removeItem('storage_service_test');
        expect(browserStorage.getItem('storage_service_test')).toBeNull();
    });
});
