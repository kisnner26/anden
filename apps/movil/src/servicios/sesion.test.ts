import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CUENTAS_MUESTRA } from './cuentasMuestra';
import {
  CLAVE_SESION,
  crearSesionLocal,
  esInvitado,
  marcarInvitado,
  normalizarIdentificador,
  olvidarInvitado,
  rolDe,
} from './sesion';

const servicio = crearSesionLocal(CUENTAS_MUESTRA);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('rolDe', () => {
  it('sin sesión es pasajero', () => {
    expect(rolDe(null)).toBe('pasajero');
  });

  it('con sesión de conductor es conductor', () => {
    expect(rolDe({ nombre: 'Ana', rol: 'conductor' })).toBe('conductor');
  });
});

describe('normalizarIdentificador', () => {
  it('ignora mayúsculas, espacios y guiones', () => {
    expect(normalizarIdentificador('  Ana@Correo.com ')).toBe('ana@correo.com');
    expect(normalizarIdentificador('8888-1234')).toBe('88881234');
  });
});

describe('sesión local', () => {
  it('empieza sin sesión', async () => {
    expect(await servicio.actual()).toBeNull();
  });

  it('el mismo ingreso sirve para los dos roles y el rol sale de la cuenta', async () => {
    const conductor = await servicio.iniciar('1002', '2026');
    expect(conductor.ok && conductor.valor.rol).toBe('conductor');
    await servicio.cerrar();
    const pasajero = await servicio.iniciar('ana@correo.com', '2026');
    expect(pasajero.ok && pasajero.valor.rol).toBe('pasajero');
  });

  it('un conductor entra con su código y se recuerda con su chofer', async () => {
    await servicio.iniciar('1002', '2026');
    expect(await servicio.actual()).toEqual({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
    });
  });

  it('un pasajero entra con su correo sin importar mayúsculas', async () => {
    const resultado = await servicio.iniciar(' ANA@correo.com ', '2026');
    expect(resultado.ok).toBe(true);
    expect(await servicio.actual()).toEqual({
      nombre: 'Ana Ruiz',
      rol: 'pasajero',
    });
  });

  it('rechaza una clave o un identificador equivocados sin decir cuál falló y no guarda nada', async () => {
    expect(await servicio.iniciar('1002', 'mala')).toEqual({
      error: 'credenciales',
      ok: false,
    });
    expect(await servicio.iniciar('9999', '2026')).toEqual({
      error: 'credenciales',
      ok: false,
    });
    expect(await servicio.actual()).toBeNull();
  });

  it('cierra la sesión', async () => {
    await servicio.iniciar('1001', '2026');
    await servicio.cerrar();
    expect(await servicio.actual()).toBeNull();
  });

  it('tolera datos dañados', async () => {
    await AsyncStorage.setItem(CLAVE_SESION, '{no es json');
    expect(await servicio.actual()).toBeNull();
    await AsyncStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ rol: 'dios', nombre: 'x' }),
    );
    expect(await servicio.actual()).toBeNull();
  });
});

describe('invitado', () => {
  it('se recuerda y se puede olvidar', async () => {
    expect(await esInvitado()).toBe(false);
    await marcarInvitado();
    expect(await esInvitado()).toBe(true);
    await olvidarInvitado();
    expect(await esInvitado()).toBe(false);
  });
});
