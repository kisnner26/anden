import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';

import {
  CLAVE_SOLICITUD_CONDUCTOR,
  cedulaOculta,
  descartarSolicitud,
  erroresDeSolicitud,
  guardarSolicitud,
  leerSolicitud,
  nuevaSolicitud,
  type DatosSolicitudConductor,
} from './solicitudConductor';

afterEach(async () => {
  await AsyncStorage.clear();
});

const DATOS: DatosSolicitudConductor = {
  apellido: 'Obando',
  cedula: '001-010190-0001A',
  cedulaDorsoUri: 'file:///dorso.jpg',
  cedulaFrenteUri: 'file:///frente.jpg',
  nombre: 'Iván',
  telefono: '8888 1234',
};

describe('erroresDeSolicitud', () => {
  it('con todo completo no hay errores', () => {
    expect(erroresDeSolicitud(DATOS)).toEqual([]);
  });

  it('la cédula es obligatoria', () => {
    expect(erroresDeSolicitud({ ...DATOS, cedula: '' })).toContain('cedula');
    expect(erroresDeSolicitud({ ...DATOS, cedula: '123' })).toContain('cedula');
  });

  it('las dos fotos de la cédula son obligatorias', () => {
    expect(erroresDeSolicitud({ ...DATOS, cedulaFrenteUri: null })).toEqual([
      'frente',
    ]);
    expect(erroresDeSolicitud({ ...DATOS, cedulaDorsoUri: null })).toEqual([
      'dorso',
    ]);
    expect(
      erroresDeSolicitud({
        ...DATOS,
        cedulaDorsoUri: null,
        cedulaFrenteUri: null,
      }),
    ).toEqual(['frente', 'dorso']);
  });

  it('marca nombre, apellido y teléfono inválidos', () => {
    expect(
      erroresDeSolicitud({
        ...DATOS,
        apellido: '',
        nombre: '1',
        telefono: '12',
      }),
    ).toEqual(['nombre', 'apellido', 'telefono']);
  });
});

describe('nuevaSolicitud', () => {
  it('queda en revisión, con la cédula formateada y el teléfono en dígitos', () => {
    const s = nuevaSolicitud(
      { ...DATOS, cedula: '0010101900001a', nombre: ' Iván ' },
      new Date('2026-11-13T10:00:00Z'),
    );
    expect(s.estado).toBe('en-revision');
    expect(s.cedula).toBe('001-010190-0001A');
    expect(s.telefono).toBe('88881234');
    expect(s.nombre).toBe('Iván');
    expect(s.biometriaConfirmada).toBe(true);
  });
});

describe('guardado', () => {
  it('empieza sin solicitud', async () => {
    expect(await leerSolicitud()).toBeNull();
  });

  it('guarda y lee la solicitud', async () => {
    const s = nuevaSolicitud(DATOS);
    await guardarSolicitud(s);
    expect(await leerSolicitud()).toEqual(s);
  });

  it('se puede descartar', async () => {
    await guardarSolicitud(nuevaSolicitud(DATOS));
    await descartarSolicitud();
    expect(await leerSolicitud()).toBeNull();
  });

  it('un valor dañado o incompleto se ignora', async () => {
    await AsyncStorage.setItem(CLAVE_SOLICITUD_CONDUCTOR, '{no es json');
    expect(await leerSolicitud()).toBeNull();
    await AsyncStorage.setItem(
      CLAVE_SOLICITUD_CONDUCTOR,
      JSON.stringify({ nombre: 'Ana' }),
    );
    expect(await leerSolicitud()).toBeNull();
  });
});

describe('cedulaOculta', () => {
  it('deja solo los últimos cuatro caracteres', () => {
    expect(cedulaOculta('001-010190-0001A')).toHaveLength(16);
    expect(cedulaOculta('001-010190-0001A').endsWith('001A')).toBe(true);
    expect(cedulaOculta('001-010190-0001A')).not.toContain('010190');
  });
});
