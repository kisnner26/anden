import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/servicios/supabase/viajesSupabase', () => ({
  leerViajesPublicados: jest.fn(),
}));

import { leerViajesPublicados } from '@/servicios/supabase/viajesSupabase';

import { DUENO_REMOTO } from './asientosRemotos';
import { motivoDeCancelacion, viajeCancelado } from './historialSalidas';
import { crearBase } from './muestra';
import { CLAVE_CACHE_VIAJES, guardarCacheViajes } from './cacheViajes';
import {
  aplicarViajesPublicados,
  cargarViajesGuardados,
  obtenerUltimaSincronizacion,
  reiniciarUltimaSincronizacion,
  sincronizarViajes,
} from './sincronizarViajes';
import { armarSalidas, armarTodasLasSalidas } from './salidas';
import { obtenerMuestra, reiniciarMuestra } from './useSalidas';

const AHORA = new Date();
const SALIDA = new Date(AHORA.getTime() + 2 * 3_600_000).toISOString();

const PUBLICADOS = {
  historial: [],
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
      punto_encuentro: '764M4PPX+HG',
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

beforeEach(async () => {
  jest.clearAllMocks();
  reiniciarMuestra();
  reiniciarUltimaSincronizacion();
  await AsyncStorage.clear();
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
    expect(salidas[0]).toMatchObject({
      puntoEncuentro: '764M4PPX+HG',
      placa: 'M 123-456',
    });
  });

  it('un viaje publicado de Boaco hacia Managua aparece entre las salidas de la terminal de Boaco y no entre las de Mayoreo', () => {
    const datos = crearBase();
    const lunes = new Date(AHORA.getTime() + 2 * 86_400_000).toISOString();
    aplicarViajesPublicados(datos, {
      ...PUBLICADOS,
      ocupacion: [],
      viajes: [
        {
          ...PUBLICADOS.viajes[0]!,
          id: 'via_lunes',
          ruta_id: 'rut_boa_may',
          salida: lunes,
        },
      ],
    });
    const desdeBoaco = armarSalidas(datos, AHORA, 'ter_boa');
    const desdeMayoreo = armarSalidas(datos, AHORA, 'ter_may');
    expect(desdeBoaco.map((s) => s.viajeId)).toContain('via_lunes');
    expect(desdeBoaco[0]?.origen).toBe('Boaco');
    expect(desdeBoaco[0]?.destino).toBe('Managua');
    expect(desdeMayoreo.map((s) => s.viajeId)).not.toContain('via_lunes');
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

describe('viajes cancelados', () => {
  it('recuerda los viajes que el conductor canceló', () => {
    aplicarViajesPublicados(crearBase(), {
      ...PUBLICADOS,
      cancelados: ['via_x'],
    });
    expect(viajeCancelado('via_x')).toBe(true);
    expect(viajeCancelado('via_a')).toBe(false);
  });

  it('recuerda por qué lo canceló, si lo dijo', () => {
    aplicarViajesPublicados(crearBase(), {
      ...PUBLICADOS,
      cancelados: ['via_x', 'via_y'],
      motivos: { via_x: 'averia' },
    });
    expect(motivoDeCancelacion('via_x')).toBe('averia');
    expect(motivoDeCancelacion('via_y')).toBeNull();
  });

  it('un viaje que el conductor ya inició se queda con su hora real, para que el boleto pase a en ruta', () => {
    const datos = crearBase();
    const real = new Date(AHORA.getTime() - 5 * 60_000).toISOString();
    const salido = { ...PUBLICADOS.viajes[0]!, salio_en: real };
    aplicarViajesPublicados(datos, { ...PUBLICADOS, viajes: [salido] });
    expect(datos.viajes).toHaveLength(1);
    expect(datos.viajes[0]?.salida).toBe(real);
  });

  it('un viaje que el conductor cerró al llegar queda como llegó', () => {
    const datos = crearBase();
    const cerrado = { ...PUBLICADOS.viajes[0]!, estado: 'llego' };
    aplicarViajesPublicados(datos, { ...PUBLICADOS, viajes: [cerrado] });
    expect(datos.viajes[0]?.estado).toBe('llego');
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

describe('sin internet', () => {
  it('al sincronizar con éxito guarda lo recibido y anota la hora', async () => {
    jest.mocked(leerViajesPublicados).mockResolvedValue(PUBLICADOS);
    await sincronizarViajes();
    expect(obtenerUltimaSincronizacion()).not.toBeNull();
    await new Promise((resolver) => setTimeout(resolver, 20));
    expect(await AsyncStorage.getItem(CLAVE_CACHE_VIAJES)).toContain('via_a');
  });

  it('al abrir sin señal muestra las salidas que se guardaron la última vez', async () => {
    await guardarCacheViajes(PUBLICADOS, new Date());
    jest.mocked(leerViajesPublicados).mockResolvedValue(null);
    expect(await cargarViajesGuardados()).toBe(true);
    expect(obtenerMuestra().viajes.map((v) => v.id)).toEqual(['via_a']);
    expect(await sincronizarViajes()).toBe(false);
    expect(obtenerMuestra().viajes.map((v) => v.id)).toEqual(['via_a']);
  });

  it('sin nada guardado no inventa salidas', async () => {
    expect(await cargarViajesGuardados()).toBe(false);
  });

  it('no pisa una sincronización más nueva con lo guardado', async () => {
    await guardarCacheViajes(PUBLICADOS, new Date(Date.now() - 3_600_000));
    jest.mocked(leerViajesPublicados).mockResolvedValue({
      ...PUBLICADOS,
      viajes: [],
    });
    await sincronizarViajes();
    expect(await cargarViajesGuardados()).toBe(false);
  });
});
