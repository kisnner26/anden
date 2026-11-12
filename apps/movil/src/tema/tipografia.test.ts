import { afterEach, describe, expect, it } from '@jest/globals';

import { establecerEscalaTexto, tipografia } from './tipografia';

afterEach(() => establecerEscalaTexto(1));

describe('tipografia', () => {
  it('con escala 1 conserva los tamaños del diseño', () => {
    expect(tipografia.cuerpo.fontSize).toBe(16);
    expect(tipografia.cuerpo.lineHeight).toBe(24);
    expect(tipografia.display.fontSize).toBe(56);
  });

  it('multiplica tamaño e interlínea con la escala', () => {
    establecerEscalaTexto(1.25);
    expect(tipografia.cuerpo.fontSize).toBe(20);
    expect(tipografia.cuerpo.lineHeight).toBe(30);
  });

  it('el cambio llega al mismo objeto sin volver a importarlo', () => {
    const cuerpo = tipografia.cuerpo;
    establecerEscalaTexto(1.25);
    expect(cuerpo.fontSize).toBe(20);
  });

  it('no toca la familia ni el resto de propiedades', () => {
    establecerEscalaTexto(1.25);
    expect(tipografia.etiqueta.fontFamily).toBe('JetBrainsMono_500Medium');
    expect(tipografia.etiqueta.textTransform).toBe('uppercase');
    expect(tipografia.etiqueta.letterSpacing).toBe(0.88);
  });

  it('se puede esparcir en un estilo con los valores vigentes', () => {
    establecerEscalaTexto(1.25);
    expect({ ...tipografia.pequeno }.fontSize).toBe(16);
  });

  it('el texto corriente crece entero y los titulares casi nada', () => {
    establecerEscalaTexto(1.25);
    expect(tipografia.cuerpo.fontSize).toBe(20);
    expect(tipografia.titularPantalla.fontSize).toBeLessThanOrEqual(48);
    expect(tipografia.display.fontSize).toBeLessThanOrEqual(58);
  });
});
