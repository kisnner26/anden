import { describe, expect, it } from 'vitest';

import {
  cobradoPorDia,
  esperaPromedio,
  lineaDeTiempo,
  rankingDeConductores,
  resumir,
  vendidosDe,
} from './analitica';
import type { Alerta, Boleto, Cierre, Encomienda, Viaje } from '../tipos';

const viaje = (id: string, extra: Partial<Viaje> = {}): Viaje => ({
  anden: 1,
  chofer_id: 'cho_1',
  estado: 'programado',
  id,
  placa: 'M 1',
  ruta_id: 'rut_may_boa',
  salida: '2026-11-12T10:00:00Z',
  salio_en: null,
  servicio: 'ordinario',
  ...extra,
});
const boleto = (id: string, viaje_id: string, estado = 'vigente'): Boleto => ({
  actualizado_en: '2026-11-12T11:00:00Z',
  asiento: 3,
  boleto_id: id,
  contenido: {
    boleto: { pasajero: { nombre: 'Ana' } },
    resumen: { destino: 'Boaco' },
  },
  estado,
  viaje_id,
});
const cierre = (
  chofer_id: string,
  cobrado: number,
  cerrado_en = '2026-11-12T20:00:00Z',
): Cierre => ({
  chofer_id,
  cerrado_en,
  cobrado,
  pasajeros: 3,
  pendiente: 10,
  viaje_id: `v${cobrado}`,
});

describe('resumir', () => {
  it('suma cierres y cuenta lo que sigue abierto', () => {
    const r = resumir({
      alertas: [{ atendida: false } as Alerta, { atendida: true } as Alerta],
      boletos: [boleto('1', 'a'), boleto('2', 'a')],
      cierres: [cierre('cho_1', 100), cierre('cho_2', 60)],
      encomiendas: [
        { estado: 'solicitada' } as Encomienda,
        { estado: 'entregada' } as Encomienda,
      ],
      viajes: [viaje('a'), viaje('b', { estado: 'cancelado' })],
    });
    expect(r).toMatchObject({
      alertasPendientes: 1,
      cobrado: 160,
      encomiendasAbiertas: 1,
      pasajeros: 6,
      porCobrar: 20,
      viajesActivos: 1,
      viajesCerrados: 2,
    });
    expect(r.ocupacionMedia).toBeCloseTo(2 / 26);
  });
});

describe('vendidosDe', () => {
  it('no cuenta los cancelados', () => {
    expect(
      vendidosDe(
        [boleto('1', 'a'), boleto('2', 'a', 'cancelado'), boleto('3', 'b')],
        'a',
      ),
    ).toBe(1);
  });
});

describe('esperaPromedio', () => {
  it('promedia los minutos entre ponerse en andén y salir', () => {
    expect(
      esperaPromedio([
        viaje('a', { salio_en: '2026-11-12T10:30:00Z' }),
        viaje('b', { salio_en: '2026-11-12T11:00:00Z' }),
        viaje('c'),
      ]),
    ).toBe(45);
    expect(esperaPromedio([viaje('a')])).toBeNull();
  });
});

describe('cobradoPorDia y ranking', () => {
  it('reparte lo cobrado por día y ordena a los conductores', () => {
    const hoy = new Date('2026-11-12T12:00:00');
    const dias = cobradoPorDia(
      [cierre('cho_1', 100), cierre('cho_1', 50, '2026-11-11T20:00:00')],
      3,
      hoy,
    );
    expect(dias.map((d) => d.total)).toEqual([0, 50, 100]);
    expect(
      rankingDeConductores([
        cierre('cho_1', 100),
        cierre('cho_2', 300),
        cierre('cho_1', 50),
      ]),
    ).toEqual([
      { chofer: 'cho_2', cobrado: 300, pasajeros: 3, viajes: 1 },
      { chofer: 'cho_1', cobrado: 150, pasajeros: 6, viajes: 2 },
    ]);
  });
});

describe('lineaDeTiempo', () => {
  it('mezcla todo y pone lo más nuevo primero', () => {
    const t = lineaDeTiempo({
      alertas: [],
      boletos: [boleto('1', 'a')],
      cierres: [cierre('cho_1', 100)],
      encomiendas: [],
      viajes: [viaje('a')],
    });
    expect(t[0]?.tipo).toBe('cierre');
    expect(t.map((e) => e.tipo)).toContain('boleto');
    expect(t.length).toBe(3);
  });

  it('respeta el límite', () => {
    const viajes = Array.from({ length: 10 }, (_, i) => viaje(String(i)));
    expect(
      lineaDeTiempo(
        { alertas: [], boletos: [], cierres: [], encomiendas: [], viajes },
        4,
      ),
    ).toHaveLength(4);
  });
});
