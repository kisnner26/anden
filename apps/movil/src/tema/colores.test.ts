import { expect, test } from '@jest/globals';

import { coloresClaros, coloresOscuros } from './colores';

test('los temas tienen las mismas claves de color', () => {
  expect(Object.keys(coloresClaros).sort()).toEqual(
    Object.keys(coloresOscuros).sort(),
  );
});
