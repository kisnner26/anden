import { describe, expect, it } from '@jest/globals';

import {
  entenderCuando,
  interpretarOrden,
  proximaSalidaA,
  telefonoDictado,
} from './ordenesIA';
import type { Salida } from './salidas';

const CIUDADES = ['Managua', 'Boaco', 'Juigalpa'];

describe('interpretarOrden', () => {
  it('agrega un contacto de emergencia con su nombre', () => {
    expect(
      interpretarOrden('Agregar a Gross como contacto de emergencia', CIUDADES),
    ).toEqual({ nombre: 'Gross', tipo: 'contacto' });
    expect(
      interpretarOrden('agrega a María José como mi contacto', CIUDADES),
    ).toEqual({ nombre: 'María José', tipo: 'contacto' });
  });

  it('muestra el viaje más próximo a un destino desde un origen', () => {
    expect(
      interpretarOrden(
        'Mostrarme el viaje más próximo a Boaco desde Managua',
        CIUDADES,
      ),
    ).toEqual({ destino: 'Boaco', origen: 'Managua', tipo: 'viaje' });
  });

  it('reserva un boleto a un destino', () => {
    expect(
      interpretarOrden('Comprarme un boleto a Juigalpa', CIUDADES),
    ).toEqual({ destino: 'Juigalpa', origen: null, tipo: 'reservar' });
    expect(interpretarOrden('reservame un asiento a Boaco', CIUDADES)).toEqual({
      destino: 'Boaco',
      origen: null,
      tipo: 'reservar',
    });
  });

  it('abre una pantalla de la app', () => {
    expect(interpretarOrden('Abrime mis boletos', CIUDADES)).toEqual({
      pantalla: 'boletos',
      tipo: 'abrir',
    });
    expect(
      interpretarOrden('quiero enviar una encomienda a Boaco', CIUDADES),
    ).toEqual({
      pantalla: 'encomienda',
      tipo: 'abrir',
    });
    expect(interpretarOrden('llevame a los ajustes', CIUDADES)).toEqual({
      pantalla: 'ajustes',
      tipo: 'abrir',
    });
  });

  it('una pregunta normal no es una orden', () => {
    expect(interpretarOrden('¿cuánto cuesta ir a Boaco?', CIUDADES)).toBeNull();
    expect(interpretarOrden('hola', CIUDADES)).toBeNull();
    expect(interpretarOrden('', CIUDADES)).toBeNull();
  });

  it('sin un destino conocido no inventa nada', () => {
    expect(interpretarOrden('comprame un boleto a Marte', CIUDADES)).toBeNull();
  });
});

describe('telefonoDictado', () => {
  it('entiende el teléfono dictado con espacios', () => {
    expect(telefonoDictado('8888 1234')).toBe('88881234');
    expect(telefonoDictado('mi número es 8888-1234')).toBe('88881234');
  });

  it('nulo si no es un teléfono de Nicaragua', () => {
    expect(telefonoDictado('hola')).toBeNull();
    expect(telefonoDictado('123')).toBeNull();
  });
});

describe('proximaSalidaA', () => {
  const AHORA = new Date(2026, 10, 12, 10, 0);
  function salida(
    id: string,
    horas: number,
    libres = 5,
    abierta = true,
  ): Salida {
    return {
      puntoEncuentro: '764M4PPX+HC',
      asientosLibres: libres,
      choferId: 'c',
      codigoDestino: 'BOA',
      destino: 'Boaco',
      estado: 'programado',
      minutosAtraso: 0,
      origen: 'Managua',
      placa: 'M 1',
      rutaId: 'r',
      salida: new Date(AHORA.getTime() + horas * 3_600_000),
      servicio: 'ordinario',
      tarifa: 60,
      ventaAbierta: abierta,
      viajeId: id,
    };
  }

  it('toma la más próxima con asientos y venta abierta', () => {
    const lista = [
      salida('lleno', 1, 0),
      salida('cerrado', 1.5, 5, false),
      salida('tarde', 4),
      salida('bien', 2),
    ];
    expect(proximaSalidaA(lista, 'Boaco', null, AHORA)?.viajeId).toBe('bien');
  });

  it('respeta el origen y devuelve nulo si no hay', () => {
    expect(proximaSalidaA([salida('a', 1)], 'Boaco', 'León', AHORA)).toBeNull();
    expect(proximaSalidaA([], 'Boaco', null, AHORA)).toBeNull();
  });
});

describe('entenderCuando', () => {
  const AHORA = new Date(2026, 10, 15, 10, 0);

  it('mañana temprano es el día siguiente, de madrugada a primera hora', () => {
    const c = entenderCuando('un asiento a Boaco mañana temprano', AHORA);
    expect(c?.franja).toBe('temprano');
    expect(c?.dia?.getDate()).toBe(16);
  });

  it('"por la mañana" es la franja y no el día siguiente', () => {
    const c = entenderCuando('un boleto por la mañana', AHORA);
    expect(c?.franja).toBe('manana');
    expect(c?.dia?.getDate()).toBe(15);
  });

  it('una hora exacta con pm se pasa a 24 horas', () => {
    expect(entenderCuando('a las 5 pm', AHORA)?.hora).toBe(17);
    expect(entenderCuando('a las 6 de la mañana', AHORA)?.hora).toBe(6);
  });

  it('un día de la semana es el próximo que llega', () => {
    expect(entenderCuando('el viernes', AHORA)?.dia?.getDay()).toBe(5);
  });

  it('sin nada de tiempo devuelve nulo', () => {
    expect(entenderCuando('un asiento a Boaco', AHORA)).toBeNull();
  });
});

describe('reservar con cuándo', () => {
  const AHORA = new Date(2026, 10, 15, 10, 0);

  it('la orden lleva lo que se dijo del momento', () => {
    const orden = interpretarOrden(
      'reservame un asiento a Boaco mañana temprano',
      CIUDADES,
      AHORA,
    );
    expect(orden?.tipo).toBe('reservar');
    expect(orden && 'cuando' in orden ? orden.cuando?.franja : null).toBe(
      'temprano',
    );
  });

  it('sin momento la orden no trae cuándo', () => {
    const orden = interpretarOrden(
      'reservame un asiento a Boaco',
      CIUDADES,
      AHORA,
    );
    expect(orden && 'cuando' in orden).toBe(false);
  });
});

describe('pedido directo', () => {
  const AHORA = new Date(2026, 10, 15, 10, 0);
  const C = ['Boaco', 'Managua'];

  it('"un asiento a Boaco mañana temprano" reserva sin decir reservame', () => {
    const orden = interpretarOrden(
      'Un asiento a Boaco mañana temprano',
      C,
      AHORA,
    );
    expect(orden?.tipo).toBe('reservar');
  });

  it('una pregunta de precio no reserva', () => {
    expect(
      interpretarOrden('¿cuánto cuesta un asiento a Boaco?', C, AHORA),
    ).toBeNull();
    expect(
      interpretarOrden('cuanto vale un boleto a Boaco', C, AHORA),
    ).toBeNull();
  });

  it('preguntar por los buses no reserva', () => {
    expect(
      interpretarOrden('muéstrame los asientos libres a Boaco', C, AHORA),
    ).toBeNull();
  });
});

describe('proximaSalidaA con cuándo', () => {
  const AHORA = new Date(2026, 10, 15, 10, 0);
  const base = {
    asientosLibres: 5,
    destino: 'Boaco',
    origen: 'Managua',
    ventaAbierta: true,
  };
  const salidas = [
    { ...base, salida: new Date(2026, 10, 15, 15, 0), viajeId: 'hoy-tarde' },
    { ...base, salida: new Date(2026, 10, 16, 5, 0), viajeId: 'manana-5' },
    { ...base, salida: new Date(2026, 10, 16, 7, 0), viajeId: 'manana-7' },
    { ...base, salida: new Date(2026, 10, 16, 17, 0), viajeId: 'manana-17' },
  ] as unknown as Parameters<typeof proximaSalidaA>[0];

  it('mañana temprano es la primera de la mañana siguiente', () => {
    const s = proximaSalidaA(salidas, 'Boaco', null, AHORA, {
      dia: new Date(2026, 10, 16),
      franja: 'temprano',
      hora: null,
    });
    expect(s?.viajeId).toBe('manana-5');
  });

  it('con una hora exacta elige la más cercana', () => {
    const s = proximaSalidaA(salidas, 'Boaco', null, AHORA, {
      dia: new Date(2026, 10, 16),
      franja: null,
      hora: 8,
    });
    expect(s?.viajeId).toBe('manana-7');
  });

  it('sin salidas en esa franja devuelve nulo', () => {
    const s = proximaSalidaA(salidas, 'Boaco', null, AHORA, {
      dia: new Date(2026, 10, 15),
      franja: 'noche',
      hora: null,
    });
    expect(s).toBeNull();
  });
});
