// Accès au stockage du navigateur, injectable dans les composants.
// Les méthodes lisent `localStorage` à chaque appel pour rester testables.
export const browserStorage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
};
