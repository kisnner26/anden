import { describe, expect, it } from '@jest/globals';

import { esReferenciaGuardada, nombreDeFoto } from './almacenFotos';

describe('nombreDeFoto', () => {
  it('conserva la extensión del original en minúscula', () => {
    expect(nombreDeFoto('file:///tmp/ImagePicker/ABC.PNG', 1, 0.5)).toMatch(
      /\.png$/,
    );
    expect(nombreDeFoto('file:///tmp/x.jpeg?v=2', 1, 0.5)).toMatch(/\.jpeg$/);
  });

  it('sin extensión conocida usa jpg', () => {
    expect(nombreDeFoto('file:///tmp/sin-extension', 1, 0.5)).toMatch(/\.jpg$/);
  });

  it('no repite nombre con otro momento o con otro azar', () => {
    const a = nombreDeFoto('x.jpg', 1000, 0.1);
    expect(nombreDeFoto('x.jpg', 1001, 0.1)).not.toBe(a);
    expect(nombreDeFoto('x.jpg', 1000, 0.2)).not.toBe(a);
  });

  it('reconoce heic y webp', () => {
    expect(nombreDeFoto('file:///tmp/a.HEIC', 1, 0.5)).toMatch(/\.heic$/);
    expect(nombreDeFoto('file:///tmp/a.webp', 1, 0.5)).toMatch(/\.webp$/);
  });

  it('no toma como extensión algo que está en medio del nombre', () => {
    expect(nombreDeFoto('file:///tmp/foto.png.bak', 1, 0.5)).toMatch(/\.jpg$/);
  });

  it('arma el nombre con letras y números sin separadores', () => {
    expect(nombreDeFoto('x.png', 1700000000000, 0.5)).toMatch(
      /^[0-9a-z]+\.png$/,
    );
  });
});

describe('esReferenciaGuardada', () => {
  it('distingue una referencia de la app de una ruta completa antigua', () => {
    expect(esReferenciaGuardada('fotos/abc.jpg')).toBe(true);
    expect(esReferenciaGuardada('file:///var/mobile/tmp/abc.jpg')).toBe(false);
  });
});
