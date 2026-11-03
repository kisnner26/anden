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

function tipoColorPng(ruta: string) {
  return readFileSync(rutaActivo(ruta)).readUInt8(25);
}

test('el icono de instalacion usa el activo maestro cuadrado', () => {
  const ruta = configuracion.expo.icon;

  expect(dimensionesPng(ruta)).toEqual({ alto: 1024, ancho: 1024 });
});

test('el icono de instalacion coincide con la captura v2 aprobada', () => {
  expect(readFileSync(rutaActivo(configuracion.expo.icon))).toEqual(
    readFileSync(
      join(RAIZ_MOVIL, '..', '..', 'mockups', 'capturas', 'v2', 'icono.png'),
    ),
  );
});

test('las variantes adaptativas de android conservan el lienzo seguro', () => {
  const adaptativo = configuracion.expo.android.adaptiveIcon;

  expect(dimensionesPng(adaptativo.foregroundImage)).toEqual({
    alto: 1024,
    ancho: 1024,
  });
  expect(dimensionesPng(adaptativo.monochromeImage)).toEqual({
    alto: 1024,
    ancho: 1024,
  });
});

test('las capas adaptativas permiten que android aplique su mascara', () => {
  const adaptativo = configuracion.expo.android.adaptiveIcon;

  expect(tipoColorPng(adaptativo.foregroundImage)).toBe(6);
  expect(tipoColorPng(adaptativo.monochromeImage)).toBe(6);
});

test('la pantalla de arranque usa la marca en ambos temas', () => {
  expect(configuracion.expo.plugins).toContainEqual([
    'expo-splash-screen',
    expect.objectContaining({
      dark: expect.objectContaining({
        image: './assets/marca/arranque-oscuro.png',
      }),
      image: './assets/marca/arranque-claro.png',
    }),
  ]);
  for (const ruta of [
    './assets/marca/arranque-claro.png',
    './assets/marca/arranque-oscuro.png',
  ]) {
    expect(dimensionesPng(ruta)).toEqual({ alto: 600, ancho: 600 });
  }
});

test('los arranques dejan ver el fondo nativo de cada tema', () => {
  expect(tipoColorPng('./assets/marca/arranque-claro.png')).toBe(6);
  expect(tipoColorPng('./assets/marca/arranque-oscuro.png')).toBe(6);
});

test('cada tema usa su propia version del titular', () => {
  const claro = readFileSync(rutaActivo('./assets/marca/arranque-claro.png'));
  const oscuro = readFileSync(rutaActivo('./assets/marca/arranque-oscuro.png'));

  expect(claro.equals(oscuro)).toBe(false);
});
