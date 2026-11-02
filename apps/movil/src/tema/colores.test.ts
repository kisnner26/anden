import { expect, test } from '@jest/globals';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { coloresClaros, coloresOscuros, paletaIconos } from './colores';
import { contraste } from './contraste';

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

test('la paleta de íconos usa hexadecimales válidos', () => {
  for (const color of Object.values(paletaIconos)) {
    expect(color).toMatch(/^#[0-9A-F]{6}$/);
  }
});

const PARES_TEXTO = [
  ['tinta', 'fondo', 4.5],
  ['tinta', 'barroOscuro', 4.5],
  ['tintaSuave', 'fondo', 4.5],
  ['tintaSuave', 'barroOscuro', 4.5],
  ['ambarTexto', 'fondo', 4.5],
  ['ambarTexto', 'barroOscuro', 4.5],
  ['ambarTitular', 'fondo', 3],
  ['sobreAmbar', 'ambar', 4.5],
  ['sobreAmbar', 'ambarProfundo', 4.5],
  ['ambar', 'bloqueNegro', 4.5],
  ['sobreNegro', 'bloqueNegro', 4.5],
  ['sobreNegroSuave', 'bloqueNegro', 4.5],
  ['aTiempo', 'fondo', 4.5],
  ['atrasado', 'fondo', 4.5],
  ['cancelado', 'fondo', 4.5],
  ['tintaPapel', 'papel', 4.5],
] as const;

describe('contraste AA en modo claro', () => {
  it.each(PARES_TEXTO)('%s sobre %s llega a %s:1', (texto, fondo, minimo) => {
    expect(
      contraste(coloresClaros[texto], coloresClaros[fondo]),
    ).toBeGreaterThanOrEqual(minimo);
  });
});
