import { describe, expect, it } from 'vitest';

import { crearAzar, mezclar, normal } from './azar';

describe('crearAzar', () => {
  it('repite la misma serie con la misma semilla', () => {
    const a = crearAzar(5);
    const b = crearAzar(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
