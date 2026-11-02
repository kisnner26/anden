import { expect, test } from '@jest/globals';

import { t } from './t';

test('obtiene un texto por su ruta', () => {
  expect(t('inicio.marca')).toBe('Andén');
});

test('una ruta inexistente falla al compilar', () => {
  // @ts-expect-error la ruta debe existir en el catálogo.
  t('inicio.inexistente');

  expect(true).toBe(true);
});
