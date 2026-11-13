import { describe, expect, it } from 'vitest';

import { esperaPromedio, resumir, type ViajeFila } from './resumen';

const viaje = (id: string, extra: Partial<ViajeFila> = {}): ViajeFila => ({
  anden: 1,
  chofer_id: 'cho_1',
  estado: 'programado',
  id,
  placa: 'M 1',
  ruta_id: 'r',
  salida: '2026-11-12T10:00:00Z',
  salio_en: null,
  servicio: 'ordinario',
  ...extra,
});

describe('resumir', () => {
  it('suma lo cobrado, los pasajeros y lo que falta cobrar', () => {
    const r = resumir(
      [
        { cobrado: 100, pasajeros: 3, pendiente: 20, viaje_id: 'a' },
        { cobrado: 60, pasajeros: 2, pendiente: 0, viaje_id: 'b' },
      ],
      [],
      [],
      [],
    );
    expect(r).toMatchObject({
      cobrado: 160,
      pasajeros: 5,
      porCobrar: 20,
      viajesCerrados: 2,
    });
  });

  it('cuenta solo viajes que esperan, encomiendas abiertas y alertas sin atender', () => {
    const r = resumir(
      [],
      [
        viaje('a'),
        viaje('b', { estado: 'cancelado' }),
        viaje('c', { salio_en: '2026-11-12T10:30:00Z' }),
      ],
      [
        {
          chofer_id: 'c',
          contenido: {
            codigo: 'E1',
            descripcion: '',
            destino: '',
            origen: '',
            tamano: 'sobre',
          },
          estado: 'solicitada',
          id: '1',
          motivo: null,
        },
        {
          chofer_id: 'c',
          contenido: {
            codigo: 'E2',
            descripcion: '',
            destino: '',
            origen: '',
            tamano: 'sobre',
          },
          estado: 'entregada',
          id: '2',
          motivo: null,
        },
      ],
      [
        {
          atendida: false,
          creada_en: '',
          id: 'x',
          lat: null,
          lng: null,
          nombre: null,
          tipo: 'choque',
          viaje_id: null,
        },
        {
          atendida: true,
          creada_en: '',
          id: 'y',
          lat: null,
          lng: null,
          nombre: null,
          tipo: 'choque',
          viaje_id: null,
        },
      ],
    );
    expect(r).toMatchObject({
      alertasPendientes: 1,
      encomiendasAbiertas: 1,
      viajesActivos: 1,
    });
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
  });

  it('nulo si ningún viaje ha salido', () => {
    expect(esperaPromedio([viaje('a')])).toBeNull();
  });
});
