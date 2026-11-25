// Source de temps : renvoie la date courante.
// Enveloppé dans une fonction fléchée pour que `new Date()` soit évalué à chaque appel.
export const defaultClock = () => new Date();
