import { afterEach, describe, expect, it } from 'vitest';

import { appDePrueba, salidaDePrueba } from './pruebas';

const abiertas: { close: () => Promise<undefined> }[] = [];

async function nueva(...argumentos: Parameters<typeof appDePrueba>) {
  const app = await appDePrueba(...argumentos);
  abiertas.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(abiertas.splice(0).map((app) => app.close()));
});

describe('salud', () => {
  it('responde ok con la versión y cuánto lleva activo', async () => {
    const app = await nueva([]);
    const respuesta = await app.inject('/salud');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({ estado: 'ok', version: '0.0.0' });
  });

  it('manda las cabeceras de seguridad', async () => {
    const app = await nueva([]);
    const { headers } = await app.inject('/salud');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toBeDefined();
  });
});

describe('GET /v1/salidas', () => {
  const salidas = [
    salidaDePrueba({ id: 'tarde', salida: '2026-11-15T20:00:00.000Z' }),
    salidaDePrueba({ id: 'manana', salida: '2026-11-15T12:00:00.000Z' }),
    salidaDePrueba({
      destino: 'Juigalpa',
      id: 'juigalpa',
      salida: '2026-11-16T12:00:00.000Z',
      servicio: 'expreso',
    }),
  ];

  it('las devuelve ordenadas de la más próxima a la más lejana', async () => {
    const app = await nueva(salidas);
    const { salidas: lista } = (await app.inject('/v1/salidas')).json();
    expect(lista.map((s: { id: string }) => s.id)).toEqual([
      'manana',
      'tarde',
      'juigalpa',
    ]);
  });

  it('filtra por destino, servicio y día', async () => {
    const app = await nueva(salidas);
    const porDestino = (
      await app.inject('/v1/salidas?destino=Juigalpa')
    ).json();
    expect(porDestino.salidas).toHaveLength(1);
    const porServicio = (
      await app.inject('/v1/salidas?servicio=expreso')
    ).json();
    expect(porServicio.salidas[0].id).toBe('juigalpa');
    const porDia = (await app.inject('/v1/salidas?dia=2026-11-15')).json();
    expect(porDia.salidas).toHaveLength(2);
  });

  it('rechaza un filtro inválido con un problema estándar', async () => {
    const app = await nueva(salidas);
    const respuesta = await app.inject('/v1/salidas?servicio=lancha&dia=ayer');
    expect(respuesta.statusCode).toBe(400);
    expect(respuesta.headers['content-type']).toContain(
      'application/problem+json',
    );
    const cuerpo = respuesta.json();
    expect(cuerpo).toMatchObject({ status: 400, title: 'Petición inválida' });
    expect(cuerpo.errores.map((e: { campo: string }) => e.campo)).toEqual(
      expect.arrayContaining(['servicio', 'dia']),
    );
  });

  it('sin resultados devuelve una lista vacía y no un error', async () => {
    const app = await nueva(salidas);
    const respuesta = await app.inject('/v1/salidas?destino=Granada');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toEqual({ salidas: [] });
  });
});

describe('GET /v1/salidas/:id', () => {
  it('devuelve el detalle de una salida', async () => {
    const app = await nueva([salidaDePrueba({ id: 'via_x' })]);
    const respuesta = await app.inject('/v1/salidas/via_x');
    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.json()).toMatchObject({ id: 'via_x', tarifa: 70 });
  });

  it('una salida que no existe da 404 como problema estándar', async () => {
    const app = await nueva([]);
    const respuesta = await app.inject('/v1/salidas/nada');
    expect(respuesta.statusCode).toBe(404);
    expect(respuesta.headers['content-type']).toContain(
      'application/problem+json',
    );
    expect(respuesta.json()).toMatchObject({
      instance: '/v1/salidas/nada',
      status: 404,
    });
  });
});

describe('límite de peticiones', () => {
  it('pasado el máximo por minuto responde 429', async () => {
    const app = await nueva([], 3);
    const codigos: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      codigos.push((await app.inject('/salud')).statusCode);
    }
    expect(codigos.slice(0, 3)).toEqual([200, 200, 200]);
    expect(codigos.slice(3)).toEqual([429, 429]);
  });
});

describe('documentación OpenAPI', () => {
  it('describe las rutas y sus esquemas', async () => {
    const app = await nueva([]);
    const doc = (await app.inject('/openapi.json')).json();
    expect(doc.openapi).toBe('3.1.0');
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining(['/salud', '/v1/salidas', '/v1/salidas/{id}']),
    );
    expect(doc.paths['/v1/salidas'].get.parameters.length).toBeGreaterThan(0);
  });
});
