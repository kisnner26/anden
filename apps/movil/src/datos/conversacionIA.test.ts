import { describe, expect, it } from '@jest/globals';

import {
  actividadDeHerramienta,
  instruccionesDeConversacion,
  leerRespuestaRica,
} from './conversacionIA';
import type { Salida } from './salidas';

const AHORA = new Date('2026-11-13T10:00:00-06:00');

function salida(id: string, minutos: number, extra: Partial<Salida> = {}) {
  return {
    puntoEncuentro: '764M4PPX+HH',
    asientosLibres: 8,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    rutaId: 'rut_1',
    salida: new Date(AHORA.getTime() + minutos * 60_000),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: id,
    ...extra,
  } as Salida;
}

describe('leerRespuestaRica por número', () => {
  const reales = [salida('via_a', 30), salida('via_b', 60)];
  const referencias = ['via_a', 'via_b'];

  it('resuelve los números [n] a salidas reales', () => {
    const r = leerRespuestaRica(
      JSON.stringify({ salidas: [2, 1, 9], texto: 'ok' }),
      reales,
      referencias,
    );
    expect(r.salidas.map((s) => s.viajeId)).toEqual(['via_b', 'via_a']);
  });

  it('acepta números escritos como texto', () => {
    const r = leerRespuestaRica(
      JSON.stringify({ salidas: ['[1]', '2'] }),
      reales,
      referencias,
    );
    expect(r.salidas.map((s) => s.viajeId)).toEqual(['via_a', 'via_b']);
  });

  it('borra del texto los ids y números que el modelo repitió', () => {
    const r = leerRespuestaRica(
      JSON.stringify({ texto: 'El bus [1] a Boaco, ID via_a, cuesta C$ 70.' }),
      reales,
      referencias,
    );
    expect(r.texto).toBe('El bus a Boaco, ID, cuesta C$ 70.');
  });
});

describe('leerRespuestaRica', () => {
  const reales = [salida('via_a', 30), salida('via_b', 60)];

  it('descarta ids de salidas que no existen', () => {
    const r = leerRespuestaRica(
      JSON.stringify({ salidas: ['via_a', 'via_inventada'], texto: 'hola' }),
      reales,
    );
    expect(r.salidas.map((s) => s.viajeId)).toEqual(['via_a']);
  });

  it('no repite salidas y deja máximo tres', () => {
    const muchas = ['a', 'b', 'c', 'd'].map((x) => salida(`via_${x}`, 10));
    const r = leerRespuestaRica(
      JSON.stringify({
        salidas: ['via_a', 'via_a', 'via_b', 'via_c', 'via_d'],
      }),
      muchas,
    );
    expect(r.salidas.map((s) => s.viajeId)).toEqual([
      'via_a',
      'via_b',
      'via_c',
    ]);
  });

  it('solo reconoce ciudades con ficha', () => {
    expect(leerRespuestaRica('{"ciudad":"boaco"}', reales).ciudad).toBe(
      'Boaco',
    );
    expect(
      leerRespuestaRica('{"ciudad":"Atlantis"}', reales).ciudad,
    ).toBeNull();
  });

  it('limpia los seguimientos y deja tres', () => {
    const r = leerRespuestaRica(
      JSON.stringify({ seguimientos: [' a ', '', 'x', 'uno', 'dos', 'tres'] }),
      reales,
    );
    expect(r.seguimientos).toEqual(['uno', 'dos', 'tres']);
  });

  it('un JSON roto o a medias no rompe nada', () => {
    expect(leerRespuestaRica('{"texto": "ho', reales).texto).toBe('');
    expect(leerRespuestaRica('no es json', reales).salidas).toEqual([]);
    expect(leerRespuestaRica('{}', reales).mostrarBoletos).toBe(false);
  });
});

describe('instruccionesDeConversacion', () => {
  it('obliga a usar las herramientas y no inventar datos', () => {
    const texto = instruccionesDeConversacion();
    expect(texto).toContain('Datos reales de Andén');
    expect(texto).toContain('nunca digas que no hay viajes');
    expect(texto).toContain('Nunca inventes');
  });

  it('agrega la línea de turista solo si corresponde', () => {
    expect(instruccionesDeConversacion({ turista: true })).toContain(
      'es turista',
    );
    expect(instruccionesDeConversacion()).not.toContain('es turista');
  });
});

describe('actividadDeHerramienta', () => {
  it('traduce cada herramienta a lo que se le muestra a la persona', () => {
    expect(actividadDeHerramienta('buscarSalidas')).toBe('Buscando salidas');
    expect(actividadDeHerramienta('otra')).toBe('Pensando');
  });
});
