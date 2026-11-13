import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/servicios/supabase/viajesSupabase', () => ({
  leerViajesPublicados: jest.fn(),
}));

import { leerViajesPublicados } from '@/servicios/supabase/viajesSupabase';

import { DUENO_REMOTO } from './asientosRemotos';
import { crearBase } from './muestra';
import {
  aplicarViajesPublicados,
  sincronizarViajes,
} from './sincronizarViajes';
import { armarTodasLasSalidas } from './salidas';
import { obtenerMuestra, reiniciarMuestra } from './useSalidas';

const AHORA = new Date();
const SALIDA = new Date(AHORA.getTime() + 2 * 3_600_000).toISOString();

const PUBLICADOS = {
  choferes: [
    {
      chofer_id: 'cho_9',
      foto_url: 'https://cdn/x.jpg',
      nombre: 'Lucía Pérez',
    },
  ],
  ocupacion: [
    { asiento: 4, viaje_id: 'via_a' },
    { asiento: 5, viaje_id: 'via_a' },
  ],
  viajes: [
    {
      anden: 3,
      chofer_id: 'cho_9',
      estado: 'programado',
      id: 'via_a',
      placa: 'M 123-456',
      ruta_id: 'rut_may_boa',
      salida: SALIDA,
      servicio: 'expreso' as const,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  reiniciarMuestra();
});

describe('aplicarViajesPublicados', () => {
  it('arma viajes, unidad y chofer con lo que publicó el conductor', () => {
    const datos = crearBase();
    aplicarViajesPublicados(datos, PUBLICADOS);
    expect(datos.viajes).toHaveLength(1);
    expect(datos.buses[0]).toMatchObject({
      placa: 'M 123-456',
      servicio: 'expreso',
    });
    expect(datos.choferes[0]).toMatchObject({
      id: 'cho_9',
      nombre: 'Lucía Pérez',
    });
    const salidas = armarTodasLasSalidas(datos, AHORA);
    expect(salidas.map((s) => s.viajeId)).toEqual(['via_a']);
    expect(salidas[0]).toMatchObject({ anden: 3, placa: 'M 123-456' });
  });

  it('marca como vendidos los asientos que ya tomaron otros teléfonos', () => {
    const datos = crearBase();
    aplicarViajesPublicados(datos, PUBLICADOS);
    expect(
      datos.ocupaciones.filter((o) => o.duenoId === DUENO_REMOTO),
    ).toHaveLength(2);
  });

  it('conserva los asientos propios y no repite los que ya están', () => {
    const datos = crearBase();
    datos.ocupaciones.push({
      asiento: 4,
      boletoId: 'bol_mio',
      duenoId: 'yo',
      estado: 'vendido',
      viajeId: 'via_a',
    });
    aplicarViajesPublicados(datos, PUBLICADOS);
    const delAsiento4 = datos.ocupaciones.filter((o) => o.asiento === 4);
    expect(delAsiento4).toHaveLength(1);
    expect(delAsiento4[0]?.duenoId).toBe('yo');
  });

  it('un chofer sin perfil publicado aparece con un nombre genérico', () => {
    const datos = crearBase();
    aplicarViajesPublicados(datos, { ...PUBLICADOS, choferes: [] });
    expect(datos.choferes[0]?.nombre).toBe('Conductor');
  });

  it('un viaje que el conductor retiró desaparece', () => {
    const datos = crearBase();
    aplicarViajesPublicados(datos, PUBLICADOS);
    aplicarViajesPublicados(datos, { ...PUBLICADOS, viajes: [] });
    expect(datos.viajes).toHaveLength(0);
    expect(datos.ocupaciones).toHaveLength(0);
  });
});

describe('sincronizarViajes', () => {
  it('sin respuesta del servidor no toca nada', async () => {
    jest.mocked(leerViajesPublicados).mockResolvedValue(null);
    const antes = obtenerMuestra().viajes.length;
    expect(await sincronizarViajes()).toBe(false);
    expect(obtenerMuestra().viajes).toHaveLength(antes);
  });

  it('con respuesta actualiza la muestra de la sesión', async () => {
    jest.mocked(leerViajesPublicados).mockResolvedValue(PUBLICADOS);
    expect(await sincronizarViajes()).toBe(true);
    expect(obtenerMuestra().viajes.map((v) => v.id)).toEqual(['via_a']);
  });
});
