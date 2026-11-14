import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  consejoDeLaMascota,
  guardarConsejosVistos,
  guardarMascotaActiva,
  leerConsejosVistos,
  leerMascotaActiva,
  marcarVisto,
  yaSeVioHoy,
  type ContextoMascota,
} from './mascota';

const MANANA = new Date(2026, 10, 14, 8, 0);

function contexto(cambios: Partial<ContextoMascota> = {}): ContextoMascota {
  return {
    ahora: MANANA,
    boletoProximo: null,
    haySalidasHoy: true,
    nombre: 'Kisnner',
    pantalla: 'viajar',
    porCalificar: false,
    sinBoletos: false,
    ...cambios,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('consejoDeLaMascota', () => {
  it('con el bus por salir avisa con alerta y dice el punto', () => {
    const c = consejoDeLaMascota(
      contexto({
        boletoProximo: { destino: 'Boaco', minutos: 10, punto: '764M4PPX+HH' },
      }),
    )!;
    expect(c.humor).toBe('alerta');
    expect(c.texto).toContain('sale en 10 min');
    expect(c.texto).toContain('4PPX+HH');
    expect(c.texto).not.toContain('764M');
  });

  it('con el bus a un par de horas recomienda salir con tiempo', () => {
    const c = consejoDeLaMascota(
      contexto({
        boletoProximo: { destino: 'Boaco', minutos: 90, punto: '764M4PPX+HH' },
      }),
    )!;
    expect(c.humor).toBe('feliz');
    expect(c.texto).toContain('1 h 30 min');
  });

  it('un viaje por calificar pasa por delante de los saludos', () => {
    expect(consejoDeLaMascota(contexto({ porCalificar: true }))?.id).toBe(
      'calificar',
    );
  });

  it('saluda según la hora y por el nombre', () => {
    expect(consejoDeLaMascota(contexto())?.texto).toContain(
      'Buenos días, Kisnner',
    );
    expect(
      consejoDeLaMascota(contexto({ ahora: new Date(2026, 10, 14, 15, 0) }))
        ?.texto,
    ).toContain('Buenas tardes');
    expect(
      consejoDeLaMascota(contexto({ ahora: new Date(2026, 10, 14, 19, 0) }))
        ?.texto,
    ).toContain('Buenas noches');
  });

  it('de madrugada o muy tarde se queda dormido', () => {
    const c = consejoDeLaMascota(
      contexto({ ahora: new Date(2026, 10, 14, 23, 0) }),
    )!;
    expect(c.humor).toBe('dormido');
  });

  it('en boletos sin ninguno invita a buscar y con boletos enseña el gesto del QR', () => {
    expect(
      consejoDeLaMascota(contexto({ pantalla: 'boletos', sinBoletos: true }))
        ?.id,
    ).toBe('sin-boletos');
    expect(consejoDeLaMascota(contexto({ pantalla: 'boletos' }))?.id).toBe(
      'truco-arrastrar',
    );
  });

  it('en horarios enseña a deslizar y si no hay salidas hoy lo dice', () => {
    expect(consejoDeLaMascota(contexto({ pantalla: 'horarios' }))?.id).toBe(
      'truco-deslizar',
    );
    expect(
      consejoDeLaMascota(
        contexto({ haySalidasHoy: false, pantalla: 'horarios' }),
      )?.humor,
    ).toBe('dormido');
  });

  it('en rutas explica cómo usarla', () => {
    expect(consejoDeLaMascota(contexto({ pantalla: 'rutas' }))?.id).toBe(
      'truco-rutas',
    );
  });
});

describe('consejos vistos', () => {
  it('un consejo se muestra una vez por día', () => {
    const vistos = marcarVisto({}, 'calificar', MANANA);
    expect(yaSeVioHoy(vistos, 'calificar', MANANA)).toBe(true);
    expect(yaSeVioHoy(vistos, 'calificar', new Date(2026, 10, 15, 8, 0))).toBe(
      false,
    );
    expect(yaSeVioHoy(vistos, 'otro', MANANA)).toBe(false);
  });

  it('la lista no crece: al marcar de nuevo se van los de días anteriores', () => {
    const ayer = marcarVisto({}, 'viejo', new Date(2026, 10, 13, 8, 0));
    const hoy = marcarVisto(ayer, 'nuevo', MANANA);
    expect(Object.keys(hoy)).toEqual(['nuevo']);
  });
});

describe('guardado', () => {
  it('recuerda si la mascota está activa; arranca apagada', async () => {
    expect(await leerMascotaActiva()).toBe(false);
    await guardarMascotaActiva(true);
    expect(await leerMascotaActiva()).toBe(true);
  });

  it('guarda y lee los consejos vistos, y un dato dañado se ignora', async () => {
    await guardarConsejosVistos({ a: '2026-11-14' });
    expect(await leerConsejosVistos()).toEqual({ a: '2026-11-14' });
    await AsyncStorage.setItem('anden.mascotaVistos', '[1,2]');
    expect(await leerConsejosVistos()).toEqual({});
  });
});
