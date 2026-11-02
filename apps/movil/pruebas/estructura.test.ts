import { expect, test } from '@jest/globals';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ_RUTAS = join(__dirname, '..', 'app');

function archivosDe(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) =>
    entrada.isDirectory()
      ? archivosDe(join(carpeta, entrada.name))
      : [join(carpeta, entrada.name)],
  );
}

// Expo Router convierte en pantalla todo archivo de app/, y Metro no empaqueta las pruebas.
test('ningún archivo de prueba vive dentro de app', () => {
  const pruebas = archivosDe(RAIZ_RUTAS).filter((archivo) =>
    /\.(test|spec)\.[jt]sx?$/.test(archivo),
  );

  expect(pruebas).toEqual([]);
});
