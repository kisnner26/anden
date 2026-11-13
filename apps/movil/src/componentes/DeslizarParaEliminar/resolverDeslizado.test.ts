import { describe, expect, it } from '@jest/globals';

import {
  ANCHO_ACCION,
  limitarDeslizado,
  resolverDeslizado,
} from './resolverDeslizado';

describe('resolverDeslizado', () => {
  it('un deslizado largo elimina', () => {
    expect(resolverDeslizado(-200, 300)).toBe('eliminar');
  });

  it('un deslizado corto deja ver la acción', () => {
    expect(resolverDeslizado(-ANCHO_ACCION, 300)).toBe('abrir');
  });

  it('un toque o un deslizado mínimo vuelve a cerrar', () => {
    expect(resolverDeslizado(-10, 300)).toBe('cerrar');
    expect(resolverDeslizado(0, 300)).toBe('cerrar');
    expect(resolverDeslizado(40, 300)).toBe('cerrar');
  });
});

describe('limitarDeslizado', () => {
  it('no deja ir a la derecha ni pasar del ancho', () => {
    expect(limitarDeslizado(30, 300)).toBe(0);
    expect(limitarDeslizado(-90, 300)).toBe(-90);
    expect(limitarDeslizado(-400, 300)).toBe(-300);
  });
});
