import { describe, expect, it } from '@jest/globals';

import {
  armarDatosParaElModelo,
  armarPrompt,
  contextoPersonal,
  entenderPregunta,
  etiquetaDia,
  hechosParaPregunta,
  limpiarTexto,
  lineaDeSalidaNumerada,
  tarifasDeLasSalidas,
  type EstadoApp,
} from './consultaIA';
import type { Salida } from './salidas';
import { boletoDePrueba } from '@/pruebas/boletos';

// viernes 13 de noviembre de 2026, 10:00
const AHORA = new Date(2026, 10, 13, 10, 0);
const CIUDADES = ['Managua', 'Boaco', 'Juigalpa'];

function salida(
  id: string,
  diasDespues: number,
  hora: number,
  extra: Partial<Salida> = {},
): Salida {
  return {
    puntoEncuentro: '764M4PPX+HH',
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 123-456',
    rutaId: 'rut_1',
    salida: new Date(2026, 10, 13 + diasDespues, hora, 0),
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
    choferes: new Map([['cho_1', 'Marvin Lanzas']]),
    ciudades: CIUDADES,
    encomiendas: [],
    habituales: [],
    nombre: 'Kisnner',
    plus: false,
    rol: 'pasajero',
    salidas: [],
    salidasPropias: [],
    ...cambios,
  };
}

describe('etiquetaDia', () => {
  it('dice hoy, mañana con su fecha, u otro día con fecha', () => {
    expect(etiquetaDia(new Date(2026, 10, 13, 15), AHORA)).toBe('hoy');
    expect(etiquetaDia(new Date(2026, 10, 14, 6), AHORA)).toBe(
      'mañana (sáb 14 nov)',
    );
    expect(etiquetaDia(new Date(2026, 10, 17, 6), AHORA)).toBe('mar 17 nov');
  });
});

describe('lineaDeSalidaNumerada', () => {
  it('lleva el número entre corchetes y nunca el id interno', () => {
    const linea = lineaDeSalidaNumerada(
      2,
      salida('via_secreto_1', 1, 6),
      AHORA,
      new Map([['cho_1', 'Marvin']]),
    );
    expect(linea.startsWith('[2] mañana')).toBe(true);
    expect(linea).toContain('C$ 70');
    expect(linea).toContain('chofer Marvin');
    expect(linea).not.toContain('via_secreto_1');
  });
});

describe('entenderPregunta', () => {
  it('"viajes próximos" no inventa filtros', () => {
    const e = entenderPregunta('busca viajes próximos', CIUDADES, AHORA);
    expect(e.destino).toBeNull();
    expect(e.dia).toBeNull();
    expect(e.intenciones.has('horarios')).toBe(true);
  });

  it('entiende destino y día en "hay viajes mañana a Boaco"', () => {
    const e = entenderPregunta('¿Hay viajes mañana a Boaco?', CIUDADES, AHORA);
    expect(e.destino).toBe('Boaco');
    expect(e.dia?.getDate()).toBe(14);
  });

  it('entiende que pregunta por el precio', () => {
    const e = entenderPregunta(
      '¿Cuánto vale el boleto a Boaco?',
      CIUDADES,
      AHORA,
    );
    expect(e.destino).toBe('Boaco');
    expect(e.intenciones.has('tarifa')).toBe(true);
  });

  it('distingue origen de destino', () => {
    const e = entenderPregunta(
      'salidas desde Juigalpa a Managua',
      CIUDADES,
      AHORA,
    );
    expect(e.origen).toBe('Juigalpa');
    expect(e.destino).toBe('Managua');
  });

  it('entiende un día de la semana como el próximo que llega', () => {
    const e = entenderPregunta('algo el lunes', CIUDADES, AHORA);
    expect(e.dia?.getDay()).toBe(1);
    expect(e.dia?.getDate()).toBe(16);
  });
});

describe('hechosParaPregunta', () => {
  const todas = [
    salida('via_hoy', 0, 15),
    salida('via_manana', 1, 6),
    salida('via_j', 1, 8, { destino: 'Juigalpa', tarifa: 90 }),
  ];
  const datos = armarDatosParaElModelo(estado({ salidas: todas }), {});

  it('con "próximos viajes" lista las próximas y la de mañana aparece', () => {
    const hechos = hechosParaPregunta(
      'busca viajes próximos',
      datos,
      CIUDADES,
      AHORA,
    );
    expect(hechos.join('\n')).toContain('mañana');
    expect(hechos.length).toBeGreaterThan(2);
  });

  it('filtra por destino y día', () => {
    const hechos = hechosParaPregunta(
      '¿hay algo mañana a Juigalpa?',
      datos,
      CIUDADES,
      AHORA,
    ).join('\n');
    expect(hechos).toContain('Juigalpa');
    expect(hechos).not.toContain('a Boaco');
  });

  it('si el filtro no coincide no dice "no hay": muestra las que sí existen', () => {
    const hechos = hechosParaPregunta(
      'algo el domingo a Boaco',
      datos,
      CIUDADES,
      AHORA,
    ).join('\n');
    expect(hechos).toContain('No hay salidas con exactamente ese filtro');
    expect(hechos).toContain('[1]');
  });

  it('para el precio incluye la tarifa del trayecto', () => {
    const hechos = hechosParaPregunta(
      '¿cuánto vale el boleto a Boaco?',
      datos,
      CIUDADES,
      AHORA,
    ).join('\n');
    expect(hechos).toContain('Tarifas:');
    expect(hechos).toContain('Managua a Boaco, ordinario: C$ 70');
  });

  it('sin ninguna salida cargada lo dice con claridad', () => {
    const vacio = armarDatosParaElModelo(estado(), {});
    expect(
      hechosParaPregunta('próximos viajes', vacio, CIUDADES, AHORA).join('\n'),
    ).toContain('no tiene ninguna salida próxima');
  });
});

describe('tarifasDeLasSalidas', () => {
  it('agrupa por trayecto y servicio con el mínimo y el máximo', () => {
    const lineas = tarifasDeLasSalidas([
      salida('a', 0, 8, { tarifa: 70 }),
      salida('b', 0, 9, { tarifa: 80 }),
      salida('c', 0, 10, { servicio: 'expreso', tarifa: 90 }),
      salida('d', 0, 11, { tarifa: null }),
    ]);
    expect(lineas).toContain(
      'Managua a Boaco, ordinario: desde C$ 70 hasta C$ 80 por pasajero',
    );
    expect(lineas).toContain('Managua a Boaco, expreso: C$ 90 por pasajero');
  });
});

describe('contextoPersonal', () => {
  it('dice quién es, qué día es y que no tiene boletos', () => {
    const texto = contextoPersonal(estado()).join('\n');
    expect(texto).toContain('Kisnner');
    expect(texto).toContain('viernes');
    expect(texto).toContain('No tiene boletos vigentes');
  });

  it('incluye el boleto próximo con su asiento, bus y chofer', () => {
    const texto = contextoPersonal(
      estado({ boletos: [boletoDePrueba(new Date(2026, 10, 14, 6, 0))] }),
    ).join('\n');
    expect(texto).toContain('Boleto: a Boaco');
    expect(texto).toContain('mañana');
    expect(texto).toContain('asiento 8');
    expect(texto).toContain('Marvin Lanzas');
  });

  it('si el viaje ya salió dice que va en él', () => {
    const texto = contextoPersonal(
      estado({ boletos: [boletoDePrueba(new Date(2026, 10, 13, 9, 0))] }),
    ).join('\n');
    expect(texto).toContain('Ahora va en este viaje');
  });

  it('a un conductor le muestra los viajes que publicó', () => {
    const texto = contextoPersonal(
      estado({ rol: 'conductor', salidasPropias: [salida('via_p', 1, 6)] }),
    ).join('\n');
    expect(texto).toContain('Como conductor publicó');
    expect(texto).toContain('mañana');
  });
});

describe('armarPrompt', () => {
  it('junta los datos de la persona, los hechos y la pregunta', () => {
    const datos = armarDatosParaElModelo(
      estado({ salidas: [salida('via_m', 1, 6)] }),
      {},
    );
    const prompt = armarPrompt('¿hay viajes mañana?', datos, CIUDADES, AHORA);
    expect(prompt).toContain('Datos reales de Andén');
    expect(prompt).toContain('Kisnner');
    expect(prompt).toContain('[1] mañana');
    expect(prompt.endsWith('Pregunta de la persona: ¿hay viajes mañana?')).toBe(
      true,
    );
    expect(prompt).not.toContain('via_m');
  });
});

describe('limpiarTexto', () => {
  it('borra ids internos y números entre corchetes', () => {
    expect(
      limpiarTexto('La salida a Boaco tiene ID via_d1_0_0 y cuesta C$ 70 [2].'),
    ).toBe('La salida a Boaco tiene ID y cuesta C$ 70.');
    expect(limpiarTexto('Sale (id=via_abc) a las 6')).toBe('Sale a las 6');
  });

  it('deja intacto un texto normal', () => {
    expect(limpiarTexto('El bus a Boaco cuesta C$ 70.')).toBe(
      'El bus a Boaco cuesta C$ 70.',
    );
  });
});
