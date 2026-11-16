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

  it('da el próximo bus con su hora y su tarifa', () => {
    const r = responderLocal('cuál es el próximo bus a Boaco', estado());
    expect(r.texto).toContain('12:00');
    expect(r.texto).toContain('C$ 70');
    expect(r.salidas).toHaveLength(2);
  });

  it('dice el rango de precios del trayecto', () => {
    const r = responderLocal('cuánto cuesta ir a Boaco', estado());
    expect(r.texto).toContain('desde C$ 70 hasta C$ 90');
  });

  it('dice que no hay salidas cuando no encuentra ninguna', () => {
    const r = responderLocal('hay bus a Juigalpa hoy', estado());
    expect(r.texto).toContain('No encontré salidas');
    expect(r.salidas).toEqual([]);
  });

  it('dice la salida más barata cuando se la piden', () => {
    const r = responderLocal('cuál es la salida más barata a Boaco', estado());
    expect(r.texto).toContain('C$ 70');
  });

  it('sin boleto vigente lo dice', () => {
    expect(responderLocal('cuándo sale mi boleto', estado()).texto).toContain(
      'No tenés boletos',
    );
  });

  it('con boleto da su hora, su asiento y el punto', () => {
    const r = responderLocal(
      'cuándo sale mi boleto',
      estado({ boletos: [boletoDePrueba(new Date(2026, 10, 13, 15, 0), 8)] }),
    );
    expect(r.texto).toContain('asiento 8');
    expect(r.mostrarBoletos).toBe(true);
  });

  it('propone abrir encomiendas', () => {
    const r = responderLocal('quiero enviar un paquete a Boaco', estado());
    expect(r.acciones).toEqual([{ pantalla: 'encomienda', tipo: 'abrir' }]);
  });

  it('cuenta qué visitar de la ciudad pedida', () => {
    const r = responderLocal('qué puedo visitar en Boaco', estado());
    expect(r.ciudad).toBe('Boaco');
    expect(r.texto).toContain('Boaco');
  });

  it('con algo fuera de tema no se inventa una respuesta', () => {
    expect(responderLocal('cuánto es dos más dos', estado()).texto).toContain(
      'No te entendí',
    );
  });
});
