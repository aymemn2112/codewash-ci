/**
 * Records storage/load failures that happen while building initial state.
 *
 * The loaders run inside `useState` initializers, so they cannot set React
 * state directly. They call `recordLoadError`; the App then consumes the
 * collected errors after mount to show a user-visible warning instead of
 * failing silently.
 */

let errors = [];

export const recordLoadError = (source) => {
    errors = [...errors, source];
};

export const getLoadErrors = () => errors;

/** Returns the collected sources and clears the buffer. */
export const consumeLoadErrors = () => {
    const current = errors;
    errors = [];
    return current;
};

export const resetLoadErrors = () => {
    errors = [];
};
