import { describe, expect, it } from '@jest/globals';

import {
  actividadDeHerramienta,
  armarDatosParaElModelo,
  instruccionesDeConversacion,
  leerRespuestaRica,
} from './conversacionIA';
import type { BoletoGuardado } from './reserva';
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

describe('armarDatosParaElModelo', () => {
  it('manda las salidas cercanas con su id y sin pasarse del tope', () => {
    const muchas = Array.from({ length: 30 }, (_, i) =>
      salida(`via_${i}`, i * 10),
    );
    const datos = armarDatosParaElModelo(muchas, [], AHORA);
    expect(datos.salidas).toHaveLength(14);
    expect(datos.salidas[0]?.linea).toContain('id=via_0');
    expect(datos.salidas[0]).toMatchObject({ destino: 'Boaco', libres: 8 });
  });

  it('incluye las fichas de las ciudades y ningún boleto si no hay', () => {
    const datos = armarDatosParaElModelo([], [], AHORA);
    expect(Object.keys(datos.fichas)).toEqual(
      expect.arrayContaining(['Managua', 'Boaco', 'Juigalpa']),
    );
    expect(datos.boletos).toEqual([]);
  });

  it('solo cuenta los boletos vigentes', () => {
    const boleto = (estado: 'usado' | 'vigente') =>
      ({
        boleto: { asiento: 3, estado, precio: 70 },
        resumen: {
          destino: 'Boaco',
          puntoEncuentro: '764M4PPX+HH',
          salida: AHORA.toISOString(),
        },
      }) as unknown as BoletoGuardado;
    const datos = armarDatosParaElModelo(
      [],
      [boleto('usado'), boleto('vigente')],
      AHORA,
    );
    expect(datos.boletos).toHaveLength(1);
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
    expect(texto).toContain('SIEMPRE las herramientas');
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
