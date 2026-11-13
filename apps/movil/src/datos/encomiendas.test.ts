import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_ENCOMIENDAS,
  codigoEncomienda,
  erroresDeEncomienda,
  guardarEncomienda,
  leerEncomiendas,
  mensajeComprobante,
  nuevaEncomienda,
  urlSmsDestinatario,
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

describe('comprobante', () => {
  const e = nuevaEncomienda(
    {
      descripcion: 'caja con repuestos',
      destinatario: 'Luis Pérez',
      destino: 'Boaco',
      fragil: true,
      origen: 'Managua',
      remitente: 'Ana Ruiz',
      tamano: 'pequeno',
      telefonoDestinatario: '8888 1234',
    },
    new Date(2026, 10, 12, 10, 0),
  );

  it('el mensaje trae código, trayecto, personas y si es frágil', () => {
    const texto = mensajeComprobante(e);
    expect(texto).toContain(e.codigo);
    expect(texto).toContain('Managua a Boaco');
    expect(texto).toContain('Ana Ruiz');
    expect(texto).toContain('Luis Pérez');
    expect(texto).toContain('frágil');
  });

  it('el aviso a quien recibe va por mensaje de texto con el código', () => {
    const url = urlSmsDestinatario(e);
    expect(url.startsWith('sms:+50588881234&body=')).toBe(true);
    expect(decodeURIComponent(url)).toContain(e.codigo);
  });

  it('los envíos guardados sin el campo frágil se leen como no frágiles', async () => {
    const { fragil: _omitido, ...sinCampo } = e;
    void _omitido;
    await AsyncStorage.setItem(CLAVE_ENCOMIENDAS, JSON.stringify([sinCampo]));
    const [leida] = await leerEncomiendas();
    expect(leida?.fragil).toBe(false);
  });
});
