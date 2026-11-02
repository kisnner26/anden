import { expect, test } from '@jest/globals';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { coloresClaros, coloresOscuros } from './colores';

test('los temas tienen las mismas claves de color', () => {
  expect(Object.keys(coloresClaros).sort()).toEqual(
    Object.keys(coloresOscuros).sort(),
  );
});

function archivosFuente(ruta: string): string[] {
  return readdirSync(ruta, { withFileTypes: true }).flatMap((entrada) => {
    const rutaEntrada = join(ruta, entrada.name);

    if (entrada.isDirectory()) {
      return archivosFuente(rutaEntrada);
    }

    return /\.(ts|tsx)$/.test(entrada.name) ? [rutaEntrada] : [];
  });
}

test('los hexadecimales solo viven en colores', () => {
  const fuente = join(process.cwd(), 'src');
  const hexadecimales = /#[0-9A-Fa-f]{3,8}\b/;
  const archivosConHex = archivosFuente(fuente).filter((ruta) => {
    return (
      !ruta.endsWith('/tema/colores.ts') &&
      hexadecimales.test(readFileSync(ruta, 'utf8'))
    );
  });

  expect(archivosConHex).toEqual([]);
});
