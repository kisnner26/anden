import { mismoDia, inicioDelDia, sumarDias } from './dias';
import type { Encomienda } from './encomiendas';
import { formatoFechaCorta, formatoHoraCompleta } from './formato';
import { formatoDiasSemana } from './formato';
import type { Habitual } from './habituales';
import { agruparPorDestino } from './historialViajes';
import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

/** todo lo que la app sabe de la persona y del momento; es lo que se le comparte al modelo */
export interface EstadoApp {
  ahora: Date;
  boletos: readonly BoletoGuardado[];
  ciudades: readonly string[];
  /** nombres de los choferes por id, para decir quién maneja cada bus */
  choferes: ReadonlyMap<string, string>;
  encomiendas: readonly Encomienda[];
  habituales: readonly Habitual[];
  nombre: string;
  plus: boolean;
  rol: string;
  /** todas las salidas que conoce la app, de cualquier terminal */
  salidas: readonly Salida[];
  /** si es conductor, las salidas que él publicó */
  salidasPropias: readonly Salida[];
}

/** una salida del snapshot: lo que las herramientas nativas pueden filtrar y devolver */
export interface SalidaParaElModelo {
  destino: string;
  id: string;
  /** milisegundos de la salida, para filtrar por día */
  inicio: number;
  libres: number;
  linea: string;
  origen: string;
  tarifa: number | null;
}

export interface DatosParaElModelo {
  boletos: string[];
  encomiendas: string[];
  fichas: Record<string, string>;
  /** lo que la app sabe de la persona: quién es, su viaje, su rol */
  personal: string[];
  salidas: SalidaParaElModelo[];
  tarifas: string[];
}

const DIAS_COMPLETOS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

/** "hoy", "mañana" o el día con su fecha, para que el modelo no tenga que calcularlo */
export function etiquetaDia(fecha: Date, ahora: Date): string {
  if (mismoDia(fecha, ahora)) return 'hoy';
  if (mismoDia(fecha, sumarDias(ahora, 1))) {
    return `mañana (${formatoFechaCorta(fecha)})`;
  }
  return formatoFechaCorta(fecha);
}

const SERVICIO: Record<string, string> = {
  expreso: 'expreso',
  ordinario: 'ordinario',
};

const ESTADO_SALIDA: Record<string, string> = {
  abordando: 'abordando',
  atrasado: 'atrasada',
  cancelado: 'cancelada',
  llego: 'ya llegó',
  programado: 'a tiempo',
  'en-ruta': 'en camino',
};

/** una salida en una línea legible, con el número entre corchetes que la identifica ante el modelo */
export function lineaDeSalidaNumerada(
  numero: number,
  salida: Salida,
  ahora: Date,
  choferes: ReadonlyMap<string, string>,
): string {
  const chofer = choferes.get(salida.choferId);
  const atraso =
    salida.minutosAtraso > 0 ? `, atrasada ${salida.minutosAtraso} min` : '';
  const venta = salida.ventaAbierta ? '' : ', venta cerrada';
  return `[${numero}] ${etiquetaDia(salida.salida, ahora)} ${formatoHoraCompleta(salida.salida)}, ${salida.origen} a ${salida.destino}, ${SERVICIO[salida.servicio] ?? salida.servicio}, ${
    salida.tarifa === null ? 'sin tarifa cargada' : `C$ ${salida.tarifa}`
  }, ${salida.asientosLibres} asientos libres, punto de encuentro ${salida.puntoEncuentro || 'por confirmar'}, bus ${salida.placa}${chofer ? `, chofer ${chofer}` : ''}, ${ESTADO_SALIDA[salida.estado] ?? salida.estado}${atraso}${venta}`;
}

export function lineaDeBoletoRica(
  { boleto, resumen }: BoletoGuardado,
  ahora: Date,
): string {
  const salida = new Date(resumen.salida);
  return `Boleto: a ${resumen.destino}${resumen.origen ? ` desde ${resumen.origen}` : ''}, ${etiquetaDia(salida, ahora)} ${formatoHoraCompleta(salida)}, asiento ${boleto.asiento}, C$ ${boleto.precio}, punto de encuentro ${resumen.puntoEncuentro || 'por confirmar'}, bus ${resumen.placa}, chofer ${resumen.choferNombre}`;
}

const ESTADO_ENCOMIENDA: Record<string, string> = {
  aceptada: 'confirmada por el chofer',
  cancelada: 'cancelada',
  entregada: 'entregada',
  recibida: 'ya va en el bus',
  rechazada: 'rechazada por el chofer',
  solicitada: 'solicitada, esperando confirmación',
};

/** los viajes ya hechos en una línea: cuántos, a dónde, cuánto gastó y cuál fue el último */
export function lineaDeHistorial(
  boletos: readonly BoletoGuardado[],
  ahora: Date,
): string | null {
  const hechos = boletos.filter(
    ({ boleto, resumen }) =>
      boleto.estado !== 'cancelado' && new Date(resumen.salida) < ahora,
  );
  if (hechos.length === 0) return null;
  const gastado = hechos.reduce((suma, { boleto }) => suma + boleto.precio, 0);
  const grupos = agruparPorDestino(hechos);
  const ultimo = grupos
    .map((g) => g.boletos[0]!)
    .sort(
      (a, b) =>
        new Date(b.resumen.salida).getTime() -
        new Date(a.resumen.salida).getTime(),
    )[0]!;
  const fechaUltimo = new Date(ultimo.resumen.salida);
  return `Historial: hizo ${hechos.length} viaje(s) y gastó C$ ${gastado} en total. Por destino: ${grupos
    .slice(0, 4)
    .map((g) => `${g.destino} ${g.boletos.length}`)
    .join(
      ', ',
    )}. El último fue a ${ultimo.resumen.destino} el ${formatoFechaCorta(fechaUltimo)}.`;
}

export function lineaDeEncomienda(encomienda: Encomienda): string {
  return `Encomienda ${encomienda.codigo}: ${encomienda.origen} a ${encomienda.destino}, ${ESTADO_ENCOMIENDA[encomienda.estado] ?? encomienda.estado}, para ${encomienda.destinatario}, ${encomienda.descripcion}${encomienda.fragil ? ', frágil' : ''}`;
}

/** las tarifas por trayecto y servicio, sacadas de todas las salidas conocidas (no solo de las que caben en el snapshot) */
export function tarifasDeLasSalidas(salidas: readonly Salida[]): string[] {
  const grupos = new Map<string, number[]>();
  for (const salida of salidas) {
    if (salida.tarifa === null) continue;
    const clave = `${salida.origen} a ${salida.destino}, ${SERVICIO[salida.servicio] ?? salida.servicio}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), salida.tarifa]);
  }
  return [...grupos.entries()].map(([clave, valores]) => {
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    return `${clave}: ${minimo === maximo ? `C$ ${minimo}` : `desde C$ ${minimo} hasta C$ ${maximo}`} por pasajero`;
  });
}

/** quién es la persona y qué tiene en marcha: se manda en cada pregunta para que el modelo no tenga que adivinar */
export function contextoPersonal(estado: EstadoApp): string[] {
  const { ahora } = estado;
  const lineas: string[] = [
    `La persona se llama ${estado.nombre || 'sin nombre'} y usa la app como ${estado.rol}${estado.plus ? ', con Andén Plus' : ''}. Hoy es ${DIAS_COMPLETOS[ahora.getDay()]} ${formatoFechaCorta(ahora)} y son las ${formatoHoraCompleta(ahora)}.`,
  ];
  const vigentes = estado.boletos
    .filter(({ boleto }) => boleto.estado === 'vigente')
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    );
  const enCurso = vigentes.find(({ resumen }) => {
    const salida = new Date(resumen.salida).getTime();
    return (
      salida <= ahora.getTime() && ahora.getTime() <= salida + 4 * 3_600_000
    );
  });
  if (enCurso) {
    lineas.push(
      `Ahora va en este viaje (ya salió): ${lineaDeBoletoRica(enCurso, ahora)}`,
    );
  }
  const proximos = vigentes.filter(
    ({ resumen }) => new Date(resumen.salida).getTime() > ahora.getTime(),
  );
  if (proximos.length === 0 && !enCurso) {
    lineas.push('No tiene boletos vigentes.');
  }
  for (const boleto of proximos.slice(0, 3)) {
    lineas.push(lineaDeBoletoRica(boleto, ahora));
  }
  const historial = lineaDeHistorial(estado.boletos, ahora);
  if (historial) lineas.push(historial);
  if (estado.habituales.length > 0) {
    const h = estado.habituales[0]!;
    lineas.push(
      `Viaje habitual: ${h.origen} a ${h.destino}, ${formatoDiasSemana(h.dias)}, ${h.hora}.`,
    );
  }
  const activas = estado.encomiendas.filter(
    (e) => e.estado !== 'entregada' && e.estado !== 'cancelada',
  );
  if (activas.length > 0) {
    lineas.push(`Tiene ${activas.length} encomienda(s) en curso.`);
  }
  if (estado.rol === 'conductor' && estado.salidasPropias.length > 0) {
    const propias = estado.salidasPropias
      .filter((s) => s.salida.getTime() >= ahora.getTime() - 3_600_000)
      .slice(0, 3)
      .map(
        (s) =>
          `${etiquetaDia(s.salida, ahora)} ${formatoHoraCompleta(s.salida)} de ${s.origen} a ${s.destino}`,
      );
    if (propias.length > 0) {
      lineas.push(
        `Como conductor publicó estos viajes: ${propias.join('; ')}.`,
      );
    }
  }
  return lineas;
}

/** el snapshot que las herramientas nativas consultan: salidas numeradas, tarifas, boletos, encomiendas y datos de la persona */
export function armarDatosParaElModelo(
  estado: EstadoApp,
  fichas: Record<string, string>,
  maximoSalidas = 30,
): DatosParaElModelo {
  const { ahora } = estado;
  const proximas = estado.salidas
    .filter((s) => s.salida.getTime() >= ahora.getTime() - 60 * 60_000)
    .sort((a, b) => a.salida.getTime() - b.salida.getTime())
    .slice(0, maximoSalidas);
  const vigentes = estado.boletos
    .filter(({ boleto }) => boleto.estado === 'vigente')
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    )
    .slice(0, 4);
  return {
    boletos: vigentes.map((b) => lineaDeBoletoRica(b, ahora)),
    encomiendas: estado.encomiendas.slice(0, 5).map(lineaDeEncomienda),
    fichas,
    personal: contextoPersonal(estado),
    salidas: proximas.map((salida, i) => ({
      destino: salida.destino,
      id: salida.viajeId,
      inicio: salida.salida.getTime(),
      libres: salida.asientosLibres,
      linea: lineaDeSalidaNumerada(i + 1, salida, ahora, estado.choferes),
      origen: salida.origen,
      tarifa: salida.tarifa,
    })),
    tarifas: tarifasDeLasSalidas(estado.salidas),
  };
}

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export type Intencion =
  'boleto' | 'encomienda' | 'horarios' | 'tarifa' | 'visitar';

export interface PreguntaEntendida {
  destino: string | null;
  dia: Date | null;
  intenciones: Set<Intencion>;
  origen: string | null;
}

const NOMBRES_DIA: [RegExp, number][] = [
  [/\bdomingo\b/, 0],
  [/\blunes\b/, 1],
  [/\bmartes\b/, 2],
  [/\bmiercoles\b/, 3],
  [/\bjueves\b/, 4],
  [/\bviernes\b/, 5],
  [/\bsabado\b/, 6],
];

/** qué pide la persona: de dónde a dónde, para cuándo y de qué se trata; solo lo que se puede leer con claridad */
export function entenderPregunta(
  pregunta: string,
  ciudades: readonly string[],
  ahora: Date,
): PreguntaEntendida {
  const texto = sinTildes(pregunta);
  const intenciones = new Set<Intencion>();
  if (
    /\b(cuanto|precio|tarifa|cuesta|vale|cobra|costo|sale el boleto)\b/.test(
      texto,
    )
  ) {
    intenciones.add('tarifa');
  }
  if (
    /\b(viaje|viajes|bus|buses|salida|salidas|horario|horarios|proxim\w*|disponible|hay|hora)\b/.test(
      texto,
    )
  ) {
    intenciones.add('horarios');
  }
  if (/\b(boleto|boletos|asiento|pasaje|mi viaje|reserv\w*)\b/.test(texto)) {
    intenciones.add('boleto');
  }
  if (/\b(encomienda|encomiendas|paquete|envio|envios)\b/.test(texto)) {
    intenciones.add('encomienda');
  }
  if (
    /\b(visitar|conocer|turista|turismo|que hacer|comer|lugares)\b/.test(texto)
  ) {
    intenciones.add('visitar');
  }

  let origen: string | null = null;
  let destino: string | null = null;
  for (const ciudad of ciudades) {
    const c = sinTildes(ciudad);
    if (!texto.includes(c)) continue;
    const desde = new RegExp(`\\b(desde|de|saliendo de)\\s+${c}\\b`).test(
      texto,
    );
    const hacia = new RegExp(
      `\\b(a|hacia|para|rumbo a|con destino a)\\s+${c}\\b`,
    ).test(texto);
    if (desde && !hacia) origen = ciudad;
    else destino = destino ?? ciudad;
  }
  // "de Managua a Boaco" ya cae bien; con una sola ciudad sin preposición, es el destino
  if (origen && destino && origen === destino) origen = null;

  let dia: Date | null = null;
  if (/\bpasado manana\b/.test(texto)) dia = sumarDias(ahora, 2);
  else if (/\bmanana\b/.test(texto)) dia = sumarDias(ahora, 1);
  else if (/\b(hoy|esta tarde|esta noche|esta manana)\b/.test(texto))
    dia = ahora;
  else {
    for (const [patron, numero] of NOMBRES_DIA) {
      if (patron.test(texto)) {
        const faltan = (numero - ahora.getDay() + 7) % 7 || 7;
        dia = sumarDias(ahora, faltan);
        break;
      }
    }
  }
  return { destino, dia, intenciones, origen };
}

/** tomar solo lo que la pregunta pide, con un tope para no llenar la memoria del modelo */
export function hechosParaPregunta(
  pregunta: string,
  datos: DatosParaElModelo,
  ciudades: readonly string[],
  ahora: Date,
): string[] {
  const entendida = entenderPregunta(pregunta, ciudades, ahora);
  const hechos: string[] = [];
  const quiereSalidas =
    entendida.intenciones.has('horarios') ||
    entendida.intenciones.has('tarifa') ||
    entendida.destino !== null ||
    entendida.origen !== null ||
    entendida.dia !== null;

  if (quiereSalidas) {
    const coinciden = datos.salidas.filter(
      (s) =>
        (entendida.destino === null || s.destino === entendida.destino) &&
        (entendida.origen === null || s.origen === entendida.origen) &&
        (entendida.dia === null ||
          mismoDia(new Date(s.inicio), entendida.dia)) &&
        s.inicio >= ahora.getTime() - 15 * 60_000,
    );
    if (coinciden.length > 0) {
      hechos.push('Salidas que coinciden con lo que pide:');
      hechos.push(...coinciden.slice(0, 6).map((s) => s.linea));
    } else {
      const proximas = datos.salidas
        .filter((s) => s.inicio >= ahora.getTime() - 15 * 60_000)
        .slice(0, 5);
      hechos.push(
        proximas.length > 0
          ? 'No hay salidas con exactamente ese filtro. Las próximas salidas que sí existen son:'
          : 'La app no tiene ninguna salida próxima cargada.',
      );
      hechos.push(...proximas.map((s) => s.linea));
    }
  }
  if (entendida.intenciones.has('tarifa')) {
    const filtradas = datos.tarifas.filter(
      (linea) =>
        (entendida.destino === null ||
          sinTildes(linea).includes(`a ${sinTildes(entendida.destino)},`)) &&
        (entendida.origen === null ||
          sinTildes(linea).startsWith(sinTildes(entendida.origen))),
    );
    const lista = filtradas.length > 0 ? filtradas : datos.tarifas;
    if (lista.length > 0) hechos.push('Tarifas:', ...lista.slice(0, 6));
  }
  if (entendida.intenciones.has('boleto') && datos.boletos.length > 0) {
    hechos.push('Boletos vigentes de la persona:', ...datos.boletos);
  }
  if (entendida.intenciones.has('encomienda')) {
    hechos.push(
      datos.encomiendas.length > 0
        ? 'Encomiendas de la persona:'
        : 'La persona no tiene encomiendas.',
      ...datos.encomiendas,
    );
  }
  return hechos;
}

/**
 * el mensaje que se le manda al modelo: los datos de la persona y los hechos que la pregunta pide, ya
 * buscados por la app, y después la pregunta. Así el modelo responde con lo que hay y no con lo que supone.
 */
export function armarPrompt(
  pregunta: string,
  datos: DatosParaElModelo,
  ciudades: readonly string[],
  ahora: Date,
): string {
  const hechos = hechosParaPregunta(pregunta, datos, ciudades, ahora);
  return [
    'Datos reales de Andén (son exactos, usalos tal cual):',
    ...datos.personal,
    ...hechos,
    '',
    `Pregunta de la persona: ${pregunta}`,
  ].join('\n');
}

/** saca del texto cualquier identificador interno o número entre corchetes que el modelo haya repetido */
export function limpiarTexto(texto: string): string {
  return texto
    .replace(/\b(?:id\s*[=:]\s*)?via_[\w-]+/gi, '')
    .replace(/\[\s*\d+\s*\]/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();
}

export { inicioDelDia };
