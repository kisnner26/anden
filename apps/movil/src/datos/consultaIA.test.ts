import { describe, expect, it } from '@jest/globals';

import {
  armarDatosParaElModelo,
  armarPrompt,
  contextoPersonal,
  entenderPregunta,
  etiquetaDia,
  hechosParaPregunta,
  limpiarTexto,
  lineaDeEncomienda,
  lineaDeHistorial,
  lineaDeSalidaNumerada,
  tarifasDeLasSalidas,
  type EstadoApp,
} from './consultaIA';
import type { Encomienda } from './encomiendas';
import type { Salida } from './salidas';

const ENCOMIENDA: Encomienda = {
  actualizadaEn: '2026-11-13T09:00:00.000Z',
  codigo: 'ENC-1',
  creadaEn: '2026-11-13T08:00:00.000Z',
  descripcion: 'caja con repuestos',
  destinatario: 'Luis Pérez',
  destino: 'Managua',
  estado: 'aceptada',
  fragil: false,
  id: 'enc_1',
  origen: 'Boaco',
  remitente: 'Ana Ruiz',
  tamano: 'pequeno',
  telefonoDestinatario: '88881234',
};
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

describe('consejo del viaje en el contexto personal', () => {
  it('suma cuándo estar en el punto de encuentro del próximo boleto', () => {
    const lineas = contextoPersonal(
      estado({ boletos: [boletoDePrueba(new Date(2026, 10, 13, 15, 0))] }),
    );
    expect(lineas.some((l) => l.includes('punto de encuentro a las'))).toBe(
      true,
    );
  });
});

describe('recomendadasPorTrayecto', () => {
  it('marca la que más conviene entre varias del mismo trayecto', () => {
    const datos = armarDatosParaElModelo(
      estado({
        salidas: [
          salida('via_cara', 0, 12, { tarifa: 90 }),
          salida('via_barata', 0, 13, { tarifa: 46 }),
        ],
      }),
      {},
    );
    const marcadas = datos.salidas.filter((s) =>
      s.linea.includes('LA QUE MÁS CONVIENE'),
    );
    expect(marcadas.map((s) => s.id)).toEqual(['via_barata']);
    expect(marcadas[0]?.linea).toContain('es la más barata');
  });

  it('no marca nada si el trayecto tiene una sola salida', () => {
    const datos = armarDatosParaElModelo(
      estado({ salidas: [salida('via_sola', 0, 12)] }),
      {},
    );
    expect(datos.salidas[0]?.linea).not.toContain('LA QUE MÁS CONVIENE');
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

  it('"qué visitar" no trae salidas ni precios', () => {
    const hechos = hechosParaPregunta(
      'Qué visitar en Boaco',
      datos,
      CIUDADES,
      AHORA,
    ).join('\n');
    expect(hechos).not.toContain('Salidas');
    expect(hechos).not.toContain('C$');
  });

  it('visitar y a la vez pedir el bus sí trae salidas', () => {
    const hechos = hechosParaPregunta(
      'qué visitar en Juigalpa y a qué hora sale el bus',
      datos,
      CIUDADES,
      AHORA,
    ).join('\n');
    expect(hechos).toContain('Juigalpa');
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
    expect(prompt).toContain('Pregunta de la persona: ¿hay viajes mañana?');
    expect(prompt.endsWith('que no pidió.')).toBe(true);
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

describe('lineaDeHistorial', () => {
  it('sin viajes hechos no dice nada', () => {
    expect(lineaDeHistorial([], AHORA)).toBeNull();
    expect(
      lineaDeHistorial([boletoDePrueba(new Date(2026, 10, 14, 6, 0))], AHORA),
    ).toBeNull();
  });

  it('cuenta los viajes, lo gastado, los destinos y el último', () => {
    const linea = lineaDeHistorial(
      [
        boletoDePrueba(new Date(2026, 10, 2, 6, 0), 5, 'AAAA2222'),
        boletoDePrueba(new Date(2026, 10, 9, 6, 0), 6, 'BBBB3333'),
      ],
      AHORA,
    )!;
    expect(linea).toContain('hizo 2 viaje(s)');
    expect(linea).toContain('C$ 92');
    expect(linea).toContain('Boaco 2');
    expect(linea).toContain('El último fue a Boaco el lun 9 nov');
  });

  it('el contexto personal la incluye', () => {
    const texto = contextoPersonal(
      estado({ boletos: [boletoDePrueba(new Date(2026, 10, 2, 6, 0))] }),
    ).join('\n');
    expect(texto).toContain('Historial: hizo 1 viaje(s)');
  });
});

describe('contexto sin internet', () => {
  it('avisa al modelo que los datos son los guardados y de hace cuánto', () => {
    const texto = contextoPersonal(
      estado({
        conexion: {
          enLinea: false,
          ultimaSincronizacion: new Date(AHORA.getTime() - 20 * 60_000),
        },
      }),
    ).join('\n');
    expect(texto).toContain('No hay internet ahora');
    expect(texto).toContain('hace 20 min');
  });

  it('con internet no dice nada de eso', () => {
    const texto = contextoPersonal(
      estado({ conexion: { enLinea: true, ultimaSincronizacion: AHORA } }),
    ).join('\n');
    expect(texto).not.toContain('No hay internet');
  });
});

describe('lineaDeEncomienda', () => {
  it('dice el estado, el destinatario y la descripción', () => {
    const linea = lineaDeEncomienda(ENCOMIENDA);
    expect(linea).toContain('Boaco a Managua');
    expect(linea).toContain('confirmada por el chofer');
    expect(linea).toContain('para Luis Pérez');
    expect(linea).toContain('caja con repuestos');
  });

  it('marca las encomiendas frágiles', () => {
    expect(lineaDeEncomienda({ ...ENCOMIENDA, fragil: true })).toContain(
      ', frágil',
    );
    expect(lineaDeEncomienda(ENCOMIENDA)).not.toContain('frágil');
  });
});

describe('contexto personal', () => {
  it('cuenta las encomiendas en curso y no las entregadas', () => {
    const lineas = contextoPersonal(
      estado({
        encomiendas: [
          ENCOMIENDA,
          { ...ENCOMIENDA, id: 'e2', estado: 'entregada' },
          { ...ENCOMIENDA, id: 'e3', estado: 'cancelada' },
        ],
      }),
    );
    expect(lineas).toContain('Tiene 1 encomienda(s) en curso.');
  });

  it('sin encomiendas en curso no dice nada de ellas', () => {
    const lineas = contextoPersonal(
      estado({ encomiendas: [{ ...ENCOMIENDA, estado: 'entregada' }] }),
    );
    expect(lineas.some((l) => l.includes('encomienda(s)'))).toBe(false);
  });

  it('nombra el viaje habitual con sus días y su hora', () => {
    const lineas = contextoPersonal(
      estado({
        habituales: [
          {
            destino: 'Managua',
            dias: [1, 3],
            hora: '06:00',
            id: 'h1',
            origen: 'Boaco',
          },
        ],
      }),
    );
    expect(lineas).toContain(
      'Viaje habitual: Boaco a Managua, lun, mié, 06:00.',
    );
  });
});
