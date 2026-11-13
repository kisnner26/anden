import { describe, expect, it } from '@jest/globals';

import { interpretarOrden, proximaSalidaA, telefonoDictado } from './ordenesIA';
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
      anden: 1,
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
