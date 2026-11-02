import { expect, test } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import configuracion from '../app.json';

const RAIZ_MOVIL = join(__dirname, '..');

function rutaActivo(ruta: string) {
  return join(RAIZ_MOVIL, ruta);
}

function dimensionesPng(ruta: string) {
  const png = readFileSync(rutaActivo(ruta));

  return {
    alto: png.readUInt32BE(20),
    ancho: png.readUInt32BE(16),
  };
}

test('el icono de instalacion usa el activo maestro cuadrado', () => {
  const ruta = configuracion.expo.icon;

  expect(dimensionesPng(ruta)).toEqual({ alto: 1024, ancho: 1024 });
});
