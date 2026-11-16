import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { intencionLocal, responderLocal } from './asistenteLocal';
import type { EstadoApp } from './consultaIA';
import type { Salida } from './salidas';

// viernes 13 de noviembre de 2026, 10:00
const AHORA = new Date(2026, 10, 13, 10, 0);

function salida(id: string, hora: number, extra: Partial<Salida> = {}): Salida {
  return {
    asientosLibres: 12,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    puntoEncuentro: '764M4PPX+HH',
    rutaId: 'r',
    salida: new Date(2026, 10, 13, hora, 0),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: id,
    ...extra,
  };
}

function estado(cambios: Partial<EstadoApp> = {}): EstadoApp {
  return {
    ahora: AHORA,
    boletos: [],
    choferes: new Map(),
    ciudades: ['Managua', 'Boaco', 'Juigalpa'],
    encomiendas: [],
    habituales: [],
    nombre: 'Kisnner',
    plus: false,
    rol: 'pasajero',
    salidas: [salida('a', 12), salida('b', 15, { tarifa: 90 })],
    salidasPropias: [],
    ...cambios,
  };
}

describe('intencionLocal', () => {
  it('reconoce una pregunta de precio', () => {
    expect(intencionLocal('cuánto cuesta ir a Boaco')?.etiqueta).toBe('precio');
  });

  it('reconoce un saludo', () => {
    expect(intencionLocal('hola')?.etiqueta).toBe('saludo');
  });

  it('reconoce una pregunta por el próximo bus', () => {
    expect(intencionLocal('cuál es el próximo bus a Juigalpa')?.etiqueta).toBe(
      'proximo_bus',
    );
  });

  it('entiende una palabra mal escrita', () => {
    expect(intencionLocal('cuanto cuesta ir a boacoo')?.etiqueta).toBe(
      'precio',
    );
  });
});

describe('responderLocal', () => {
  it('saluda por el nombre', () => {
    expect(responderLocal('hola', estado()).texto).toContain('Kisnner');
  });
});
