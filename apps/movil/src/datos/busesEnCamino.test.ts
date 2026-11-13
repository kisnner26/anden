import { describe, expect, it } from '@jest/globals';

import { busesHacia } from './busesEnCamino';
import { trazoEntre } from './trazoCorredor';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 12, 10, 0);

function salida(
  origen: string,
  destino: string,
  minutosDesdeAhora: number,
  extra: Partial<Salida> = {},
): Salida {
  return {
    anden: 1,
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'X',
    destino,
    estado: minutosDesdeAhora < 0 ? 'en-ruta' : 'programado',
    minutosAtraso: 0,
    origen,
    placa: 'M 1',
    rutaId: 'r',
    salida: new Date(AHORA.getTime() + minutosDesdeAhora * 60_000),
    servicio: 'ordinario',
    tarifa: 66,
    ventaAbierta: true,
    viajeId: `${origen}${destino}${minutosDesdeAhora}`,
    ...extra,
  };
}

describe('busesHacia', () => {
  const duracion = trazoEntre('Boaco', 'Managua')!.duracionMin;

  it('un bus que salió hace la mitad del viaje va por la mitad', () => {
    const [bus] = busesHacia(
      'Managua',
      [salida('Boaco', 'Managua', -Math.round(duracion / 2))],
      AHORA,
    );
    expect(bus?.fuente).toBe('horario');
    expect(bus?.progreso).toBeGreaterThan(0.45);
    expect(bus?.progreso).toBeLessThan(0.55);
    expect(bus?.minutosRestantes).toBeGreaterThan(0);
    expect(bus?.minutosParaSalir).toBeNull();
  });

  it('solo cuenta los que van a esa ciudad', () => {
    const lista = busesHacia(
      'Managua',
      [salida('Boaco', 'Managua', -10), salida('Managua', 'Boaco', -10)],
      AHORA,
    );
    expect(lista).toHaveLength(1);
    expect(lista[0]?.salida.destino).toBe('Managua');
  });

  it('uno que todavía no sale muestra cuánto falta y llegaría después', () => {
    const [bus] = busesHacia(
      'Managua',
      [salida('Boaco', 'Managua', 20)],
      AHORA,
    );
    expect(bus?.minutosParaSalir).toBe(20);
    expect(bus?.progreso).toBe(0);
    expect(bus?.minutosRestantes).toBe(duracion + 20);
  });

  it('no muestra los que salen dentro de mucho', () => {
    expect(
      busesHacia('Managua', [salida('Boaco', 'Managua', 200)], AHORA),
    ).toEqual([]);
  });

  it('no muestra los que ya llegaron ni los cancelados', () => {
    expect(
      busesHacia(
        'Managua',
        [
          salida('Boaco', 'Managua', -(duracion + 30)),
          salida('Boaco', 'Managua', -5, { estado: 'cancelado' }),
        ],
        AHORA,
      ),
    ).toEqual([]);
  });

  it('ordena por quién llega primero', () => {
    const lista = busesHacia(
      'Managua',
      [salida('Boaco', 'Managua', -10), salida('Boaco', 'Managua', -60)],
      AHORA,
    );
    expect(lista.map((b) => b.salida.viajeId)).toEqual([
      'BoacoManagua-60',
      'BoacoManagua-10',
    ]);
  });

  it('el atraso corre la salida y la llegada', () => {
    const [sinAtraso] = busesHacia(
      'Managua',
      [salida('Boaco', 'Managua', 10)],
      AHORA,
    );
    const [conAtraso] = busesHacia(
      'Managua',
      [
        salida('Boaco', 'Managua', 10, {
          estado: 'atrasado',
          minutosAtraso: 15,
        }),
      ],
      AHORA,
    );
    expect(conAtraso!.minutosRestantes - sinAtraso!.minutosRestantes).toBe(15);
  });

  it('con la ubicación del conductor usa esa y lo marca en vivo', () => {
    const camino = trazoEntre('Boaco', 'Managua')!;
    const medio = camino.puntos[Math.floor(camino.puntos.length / 2)]!;
    const [bus] = busesHacia(
      'Managua',
      [salida('Boaco', 'Managua', -5)],
      AHORA,
      new Map([
        [
          'BoacoManagua-5',
          {
            lat: medio.lat,
            lng: medio.lng,
            registradaEn: AHORA.toISOString(),
            velocidadMs: 15,
          },
        ],
      ]),
    );
    expect(bus?.fuente).toBe('en-vivo');
    expect(bus?.progreso).toBeGreaterThan(0.3);
    expect(bus?.progreso).toBeLessThan(0.7);
  });
});
