// Source de hasard : renvoie un nombre dans [0, 1), comme Math.random.
// Enveloppé dans une fonction fléchée (et non `= Math.random`) pour que
// Math.random soit lu à chaque appel : les tests qui font
// vi.spyOn(Math, 'random') continuent ainsi de fonctionner.
export const defaultRng = () => Math.random();
