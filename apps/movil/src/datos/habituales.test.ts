import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_HABITUALES,
  agruparHabituales,
  conHabitual,
  esSalidaHabitual,
  guardarHabituales,
  habitualDeSalida,
  horaTexto,
  leerHabituales,
  proximaDelHabitual,
  sinHabitual,
  type Habitual,
} from './habituales';
import type { Salida } from './salidas';

// lunes 16 de noviembre de 2026
const LUNES_6AM = new Date(2026, 10, 16, 6, 0);

function salida(parcial: Partial<Salida>): Salida {
  return {
    puntoEncuentro: '764M4PPX+HC',
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'MAY',
    destino: 'Managua',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Boaco',
    placa: 'M 000000',
    rutaId: 'rut_boa_may',
    salida: LUNES_6AM,
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: 'via_1',
    ...parcial,
  };
}

const HABITUAL: Habitual = {
  destino: 'Managua',
  dias: [1],
  hora: '06:00',
  id: 'hab_boaco_managua_06:00',
  origen: 'Boaco',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('habitualDeSalida', () => {
  it('toma el trayecto, la hora y el día de la semana de la salida', () => {
    expect(habitualDeSalida('Boaco', 'Managua', LUNES_6AM)).toEqual(HABITUAL);
  });

  it('escribe la hora con dos dígitos', () => {
    expect(horaTexto(new Date(2026, 10, 16, 5, 5))).toBe('05:05');
  });
});

describe('conHabitual y sinHabitual', () => {
  it('suma un día nuevo al mismo viaje en vez de repetirlo', () => {
    const miercoles = { ...HABITUAL, dias: [3] };
    const lista = conHabitual([HABITUAL], miercoles);
    expect(lista).toHaveLength(1);
    expect(lista[0]?.dias).toEqual([1, 3]);
  });

  it('agrega un viaje distinto', () => {
    const otro = { ...HABITUAL, hora: '17:30', id: 'hab_boaco_managua_17:30' };
    expect(conHabitual([HABITUAL], otro)).toHaveLength(2);
  });

  it('quita un viaje por su id', () => {
    expect(sinHabitual([HABITUAL], HABITUAL.id)).toEqual([]);
  });
});

describe('esSalidaHabitual', () => {
  it('acepta la misma hora un día que corresponde', () => {
    expect(esSalidaHabitual(HABITUAL, salida({}))).toBe(true);
  });

  it('acepta una hora cercana dentro del margen', () => {
    expect(
      esSalidaHabitual(
        HABITUAL,
        salida({ salida: new Date(2026, 10, 16, 6, 40) }),
      ),
    ).toBe(true);
  });

  it('rechaza una hora lejos, otro día de la semana o otro trayecto', () => {
    expect(
      esSalidaHabitual(
        HABITUAL,
        salida({ salida: new Date(2026, 10, 16, 9, 30) }),
      ),
    ).toBe(false);
    expect(
      esSalidaHabitual(
        HABITUAL,
        salida({ salida: new Date(2026, 10, 17, 6, 0) }),
      ),
    ).toBe(false);
    expect(esSalidaHabitual(HABITUAL, salida({ origen: 'Juigalpa' }))).toBe(
      false,
    );
  });
});

describe('proximaDelHabitual', () => {
  const ahora = new Date(2026, 10, 15, 20, 0);

  it('elige la primera salida que coincide y todavía no partió', () => {
    const lunes = salida({ viajeId: 'lunes' });
    const lunesSiguiente = salida({
      salida: new Date(2026, 10, 23, 6, 0),
      viajeId: 'lunes2',
    });
    expect(
      proximaDelHabitual(HABITUAL, [lunesSiguiente, lunes], ahora)?.viajeId,
    ).toBe('lunes');
  });

  it('salta las que ya partieron y las que no se pueden reservar', () => {
    const pasada = salida({
      salida: new Date(2026, 10, 9, 6, 0),
      viajeId: 'pasada',
    });
    const cerrada = salida({ ventaAbierta: false, viajeId: 'cerrada' });
    expect(proximaDelHabitual(HABITUAL, [pasada, cerrada], ahora)).toBeNull();
  });
});

describe('guardado', () => {
  it('guarda y lee la lista', async () => {
    await guardarHabituales([HABITUAL]);
    expect(await leerHabituales()).toEqual([HABITUAL]);
  });

  it('tolera datos dañados y descarta entradas incompletas', async () => {
    await AsyncStorage.setItem(CLAVE_HABITUALES, 'no es json');
    expect(await leerHabituales()).toEqual([]);
    await AsyncStorage.setItem(
      CLAVE_HABITUALES,
      JSON.stringify([{ id: 'x' }, HABITUAL]),
    );
    expect(await leerHabituales()).toEqual([HABITUAL]);
  });
});

describe('agruparHabituales', () => {
  const base = {
    destino: 'Boaco',
    dias: [5],
    origen: 'Managua',
  };

  it('junta en una sola tarjeta el mismo trayecto a distintas horas', () => {
    const grupos = agruparHabituales([
      { ...base, hora: '16:30', id: 'a' },
      { ...base, hora: '03:10', id: 'b' },
      { ...base, destino: 'Juigalpa', hora: '06:00', id: 'c' },
    ]);
    expect(grupos).toHaveLength(2);
    expect(grupos[0]).toMatchObject({
      destino: 'Boaco',
      horas: ['03:10', '16:30'],
    });
    expect(grupos[0]?.miembros.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('suma los días de los viajes del trayecto sin repetirlos', () => {
    const [grupo] = agruparHabituales([
      { ...base, dias: [5, 1], hora: '03:10', id: 'a' },
      { ...base, dias: [5, 3], hora: '16:30', id: 'b' },
    ]);
    expect(grupo?.dias).toEqual([1, 3, 5]);
  });

  it('quitar varios ids a la vez deja los demás', () => {
    const lista = [
      { ...base, hora: '03:10', id: 'a' },
      { ...base, hora: '16:30', id: 'b' },
      { ...base, hora: '18:00', id: 'c' },
    ];
    expect(sinHabitual(lista, ['a', 'b']).map((h) => h.id)).toEqual(['c']);
  });
});
