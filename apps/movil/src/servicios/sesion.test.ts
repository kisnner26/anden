import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CUENTAS_CONDUCTOR_MUESTRA } from './cuentasMuestra';
import { CLAVE_SESION, crearSesionLocal, rolDe } from './sesion';

const servicio = crearSesionLocal(CUENTAS_CONDUCTOR_MUESTRA);

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

describe('sesión local', () => {
  it('empieza sin sesión', async () => {
    expect(await servicio.actual()).toBeNull();
  });

  it('inicia como conductor con código y clave correctos y la recuerda', async () => {
    const resultado = await servicio.iniciarComoConductor('1002', '2026');
    expect(resultado.ok).toBe(true);
    expect(await servicio.actual()).toEqual({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
    });
  });

  it('rechaza una clave o un código equivocados y no guarda nada', async () => {
    expect(await servicio.iniciarComoConductor('1002', 'mala')).toEqual({
      error: 'credenciales',
      ok: false,
    });
    expect(await servicio.iniciarComoConductor('9999', '2026')).toEqual({
      error: 'credenciales',
      ok: false,
    });
    expect(await servicio.actual()).toBeNull();
  });

  it('ignora espacios alrededor del código', async () => {
    expect((await servicio.iniciarComoConductor(' 1001 ', '2026')).ok).toBe(
      true,
    );
  });

  it('cierra la sesión', async () => {
    await servicio.iniciarComoConductor('1001', '2026');
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
