import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CUENTAS_MUESTRA } from './cuentasMuestra';
import {
  CLAVE_SESION,
  crearSesionLocal,
  normalizarIdentificador,
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
    const pasajero = await servicio.iniciar('ana', '2026');
    expect(pasajero.ok && pasajero.valor.rol).toBe('pasajero');
  });

  it('un conductor entra con su código y se recuerda con su chofer', async () => {
    await servicio.iniciar('1002', '2026');
    expect(await servicio.actual()).toEqual({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
      usuario: undefined,
    });
  });

  it('un pasajero entra con su usuario sin importar mayúsculas', async () => {
    const resultado = await servicio.iniciar(' ANA ', '2026');
    expect(resultado.ok).toBe(true);
    expect(await servicio.actual()).toEqual({
      choferId: undefined,
      nombre: 'Ana Ruiz',
      rol: 'pasajero',
      usuario: 'ana',
    });
  });

  it('el correo ya no sirve para entrar', async () => {
    expect(await servicio.iniciar('ana@correo.com', '2026')).toEqual({
      error: 'credenciales',
      ok: false,
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

describe('registro local', () => {
  const datos = {
    apellido: 'Pérez',
    clave: 'andén2026',
    nombre: 'Luis',
    telefono: '8888 1234',
    usuario: 'Luis.P',
  };

  it('crea la cuenta, deja la sesión iniciada y se entra con usuario o teléfono', async () => {
    const creada = await servicio.registrar(datos);
    expect(creada.ok && creada.valor.usuario).toBe('luis.p');
    await servicio.cerrar();
    expect((await servicio.iniciar('luis.p', 'andén2026')).ok).toBe(true);
    await servicio.cerrar();
    expect((await servicio.iniciar('+505 8888-1234', 'andén2026')).ok).toBe(
      true,
    );
  });

  it('no repite el usuario ni el teléfono', async () => {
    await servicio.registrar(datos);
    expect(
      await servicio.registrar({ ...datos, telefono: '7777 0000' }),
    ).toEqual({ error: 'usuario-tomado', ok: false });
    expect(
      await servicio.registrar({ ...datos, usuario: 'otro.luis' }),
    ).toEqual({ error: 'telefono-tomado', ok: false });
  });

  it('no deja tomar el usuario de una cuenta de muestra', async () => {
    expect(await servicio.registrar({ ...datos, usuario: 'ana' })).toEqual({
      error: 'usuario-tomado',
      ok: false,
    });
  });
});
