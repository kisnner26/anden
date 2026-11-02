import { describe, expect, it } from 'vitest';
import { buscarViajes } from './busqueda';
import type { DatosViajes } from './tipos';
const datos: DatosViajes = {
  terminales: [],
  rutas: [
    {
      id: 'r',
      origenId: 'a',
      destinoId: 'c',
      paradas: [
        { tipo: 'terminal', terminalId: 'a', minutosDesdeOrigen: 0 },
        { tipo: 'terminal', terminalId: 'b', minutosDesdeOrigen: 30 },
        { tipo: 'terminal', terminalId: 'c', minutosDesdeOrigen: 60 },
      ],
      distanciaKm: 1,
      duracionMin: 60,
      tarifaBase: 40,
    },
  ],
  buses: [
    {
      id: 'b',
      placa: 'x',
      cooperativa: 'x',
      tipo: 'ordinario',
      configuracion: 'micro15',
      comodidades: [],
    },
  ],
  choferes: [
    {
      id: 'ch',
      nombre: 'x',
      fotoUrl: 'x',
      aniosManejando: 1,
      licenciaVerificada: true,
      viajesRealizados: 1,
    },
  ],
  viajes: [
    {
      id: 'v',
      rutaId: 'r',
      busId: 'b',
      choferId: 'ch',
      salida: '2026-11-03T10:00:00-06:00',
      anden: 1,
      estado: 'programado',
      minutosAtraso: 0,
    },
  ],
  ocupaciones: [],
};
describe('buscarViajes', () => {
  it('encuentra un tramo con parada intermedia', () => {
    const r = buscarViajes(
      { origenId: 'b', destinoId: 'c', fecha: '2026-11-03', pasajeros: 1 },
      datos,
      new Date('2026-11-02T12:00:00-06:00'),
    );
    expect(r[0]?.tramo).toEqual({ desde: 1, hasta: 2 });
  });
});
