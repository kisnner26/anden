import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_PAGOS,
  crearPagosLocal,
  estadoDePago,
  resumenDeCobro,
} from './pagos';

const servicio = crearPagosLocal();

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('pagos locales', () => {
  it('empieza sin pagos y todo está pendiente', async () => {
    const registro = await servicio.leer();
    expect(registro).toEqual({});
    expect(estadoDePago(registro, 'bol_1')).toBe('pendiente');
  });

  it('marca un boleto pagado en efectivo con quién y cuándo', async () => {
    const ahora = new Date('2026-11-12T18:00:00.000Z');
    const registro = await servicio.marcarPagado('bol_1', 'cho_2', ahora);
    expect(registro.bol_1).toEqual({
      estado: 'pagado_efectivo',
      marcadoEn: ahora.toISOString(),
      marcadoPor: 'cho_2',
    });
    expect(await servicio.leer()).toEqual(registro);
  });

  it('revierte un pago marcado por error', async () => {
    await servicio.marcarPagado('bol_1', 'cho_2');
    const registro = await servicio.revertir('bol_1');
    expect(estadoDePago(registro, 'bol_1')).toBe('pendiente');
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_PAGOS, '{no es json');
    expect(await servicio.leer()).toEqual({});
    await AsyncStorage.setItem(CLAVE_PAGOS, '[1,2]');
    expect(await servicio.leer()).toEqual({});
  });
});

describe('resumenDeCobro', () => {
  const boletos = [
    { id: 'a', precio: 70 },
    { id: 'b', precio: 70 },
    { id: 'c', precio: 85 },
  ];

  it('suma lo cobrado y lo que falta', () => {
    const resumen = resumenDeCobro(boletos, {
      a: { estado: 'pagado_efectivo' },
      c: { estado: 'pagado_efectivo' },
    });
    expect(resumen).toEqual({
      cobrado: 155,
      pagados: 2,
      pendiente: 70,
      total: 225,
    });
  });

  it('sin boletos no hay nada que cobrar', () => {
    expect(resumenDeCobro([], {})).toEqual({
      cobrado: 0,
      pagados: 0,
      pendiente: 0,
      total: 0,
    });
  });
});
