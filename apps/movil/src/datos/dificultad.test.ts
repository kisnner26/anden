import { describe, expect, it } from '@jest/globals';

import {
  DIFICULTAD_INICIAL,
  ENFRIAMIENTO_MS,
  registrarSenal,
  registrarToque,
  VENTANA_MS,
} from './dificultad';

describe('registrarSenal', () => {
  it('una señal suelta no alcanza', () => {
    const r = registrarSenal(DIFICULTAD_INICIAL, 'errorFormulario', 1000);
    expect(r.asomar).toBeNull();
  });

  it('varias señales seguidas suman hasta asomarse, con la que más pesó', () => {
    let e = DIFICULTAD_INICIAL;
    e = registrarSenal(e, 'errorFormulario', 1000).estado;
    const r = registrarSenal(e, 'errorIngreso', 5000);
    expect(r.asomar).toBe('errorIngreso');
  });

  it('un toque repetido solo ya alcanza', () => {
    expect(
      registrarSenal(DIFICULTAD_INICIAL, 'toquesRepetidos', 0).asomar,
    ).toBe('toquesRepetidos');
  });

  it('las señales viejas dejan de contar', () => {
    let e = DIFICULTAD_INICIAL;
    e = registrarSenal(e, 'errorIngreso', 0).estado;
    const r = registrarSenal(e, 'errorFormulario', VENTANA_MS + 1000);
    expect(r.asomar).toBeNull();
  });

  it('después de asomarse espera un buen rato antes de volver', () => {
    const primera = registrarSenal(DIFICULTAD_INICIAL, 'toquesRepetidos', 0);
    const pronto = registrarSenal(primera.estado, 'toquesRepetidos', 60_000);
    expect(pronto.asomar).toBeNull();
    const luego = registrarSenal(
      pronto.estado,
      'toquesRepetidos',
      ENFRIAMIENTO_MS + 1000,
    );
    expect(luego.asomar).toBe('toquesRepetidos');
  });
});

describe('registrarToque', () => {
  it('seis toques rápidos en el mismo lugar son toques repetidos', () => {
    let toques: { en: number; x: number; y: number }[] = [];
    let repetidos = false;
    for (let i = 0; i < 6; i += 1) {
      const r = registrarToque(toques, { en: i * 250, x: 100, y: 200 });
      toques = r.toques;
      repetidos = r.repetidos;
    }
    expect(repetidos).toBe(true);
  });

  it('toques en lugares distintos no cuentan', () => {
    let toques: { en: number; x: number; y: number }[] = [];
    let repetidos = false;
    for (let i = 0; i < 6; i += 1) {
      const r = registrarToque(toques, { en: i * 300, x: i * 150, y: 200 });
      toques = r.toques;
      repetidos = r.repetidos;
    }
    expect(repetidos).toBe(false);
  });

  it('toques lentos no cuentan', () => {
    let toques: { en: number; x: number; y: number }[] = [];
    let repetidos = false;
    for (let i = 0; i < 6; i += 1) {
      const r = registrarToque(toques, { en: i * 1500, x: 100, y: 200 });
      toques = r.toques;
      repetidos = r.repetidos;
    }
    expect(repetidos).toBe(false);
  });
});
