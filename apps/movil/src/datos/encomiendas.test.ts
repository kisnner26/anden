import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_ENCOMIENDAS,
  codigoEncomienda,
  erroresDeEncomienda,
  guardarEncomienda,
  leerEncomiendas,
  nuevaEncomienda,
  type DatosEncomienda,
} from './encomiendas';

const DATOS: DatosEncomienda = {
  descripcion: 'caja con repuestos',
  destinatario: 'Luis Pérez',
  destino: 'Managua',
  origen: 'Boaco',
  remitente: 'Ana Ruiz',
  tamano: 'pequeno',
  telefonoDestinatario: '+505 8888 1234',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('erroresDeEncomienda', () => {
  it('con todo bien no hay errores', () => {
    expect(erroresDeEncomienda(DATOS)).toEqual([]);
  });

  it('marca cada campo que no sirve', () => {
    expect(
      erroresDeEncomienda({
        ...DATOS,
        descripcion: '',
        destinatario: '',
        remitente: '',
        telefonoDestinatario: '123',
      }),
    ).toEqual(['remitente', 'destinatario', 'telefono', 'descripcion']);
  });
});

describe('nuevaEncomienda', () => {
  const ahora = new Date('2026-11-12T18:00:00.000Z');

  it('guarda el teléfono en dígitos y recorta los textos', () => {
    const e = nuevaEncomienda(
      { ...DATOS, descripcion: '  caja ', remitente: ' Ana ' },
      ahora,
    );
    expect(e.telefonoDestinatario).toBe('88881234');
    expect(e.descripcion).toBe('caja');
    expect(e.remitente).toBe('Ana');
    expect(e.estado).toBe('solicitada');
  });

  it('trae un código corto que empieza con ENC-', () => {
    expect(nuevaEncomienda(DATOS, ahora).codigo).toMatch(/^ENC-[A-Z2-9]{6}$/);
  });

  it('el código depende de la semilla y es estable', () => {
    expect(codigoEncomienda(123456)).toBe(codigoEncomienda(123456));
    expect(codigoEncomienda(1)).not.toBe(codigoEncomienda(2));
  });
});

describe('guardado', () => {
  it('guarda con la más nueva primero', async () => {
    await guardarEncomienda(nuevaEncomienda(DATOS, new Date(1_000_000)));
    const lista = await guardarEncomienda(
      nuevaEncomienda(DATOS, new Date(2_000_000)),
    );
    expect(lista).toHaveLength(2);
    expect(lista[0]?.id).toBe('enc_2000000');
    expect(await leerEncomiendas()).toHaveLength(2);
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_ENCOMIENDAS, 'no es json');
    expect(await leerEncomiendas()).toEqual([]);
    await AsyncStorage.setItem(
      CLAVE_ENCOMIENDAS,
      JSON.stringify([{ id: 'x' }]),
    );
    expect(await leerEncomiendas()).toEqual([]);
  });
});
