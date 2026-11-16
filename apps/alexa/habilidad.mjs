// la habilidad de Alexa de Andén: entiende cuatro pedidos (próximo bus, precio, asientos y ayuda) y los contesta con las
// salidas reales de la API. No usa librerías: Alexa manda y espera JSON, y todo lo demás es esta función.

export const CIUDADES = ['Managua', 'Boaco', 'Juigalpa'];

/** quita tildes y mayúsculas para comparar lo que Alexa entendió con los nombres de las ciudades */
export function sinTildes(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** la ciudad que dijo la persona entre las que existen; nulo si no se entendió ninguna */
export function ciudadDe(texto) {
  const buscado = sinTildes(texto);
  return CIUDADES.find((c) => sinTildes(c) === buscado) ?? null;
}

/** la hora como se dice en voz alta: "3 y 30 de la tarde", "6 de la mañana", "12 del mediodía" */
export function horaHablada(fecha) {
  const h = fecha.getHours();
  const m = fecha.getMinutes();
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  const parte =
    h < 12 ? 'de la mañana' : h < 19 ? 'de la tarde' : 'de la noche';
  if (h === 12 && m === 0) return '12 del mediodía';
  if (h === 0 && m === 0) return '12 de la noche';
  const minutos = m === 0 ? '' : m === 30 ? ' y media' : ` y ${m}`;
  return `${hora12}${minutos} ${parte}`;
}

function mismoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

/** "hoy", "mañana" o el día de la semana */
export function diaHablado(fecha, ahora) {
  if (mismoDia(fecha, ahora)) return 'hoy';
  const manana = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() + 1,
  );
  if (mismoDia(fecha, manana)) return 'mañana';
  return `el ${DIAS[fecha.getDay()]}`;
}

/** la salida que todavía se puede tomar más pronto: con venta abierta, asientos y sin haber salido */
export function proximaSalida(salidas, ahora) {
  return (
    salidas
      .filter(
        (s) =>
          s.ventaAbierta &&
          s.asientosLibres > 0 &&
          new Date(s.salida).getTime() >= ahora.getTime(),
      )
      .sort(
        (a, b) => new Date(a.salida).getTime() - new Date(b.salida).getTime(),
      )[0] ?? null
  );
}

function respuesta(texto, { cerrar = false, repregunta } = {}) {
  return {
    response: {
      outputSpeech: { text: texto, type: 'PlainText' },
      ...(repregunta
        ? {
            reprompt: { outputSpeech: { text: repregunta, type: 'PlainText' } },
          }
        : {}),
      shouldEndSession: cerrar,
    },
    sessionAttributes: {},
    version: '1.0',
  };
}

const AYUDA =
  'Podés preguntarme cuál es el próximo bus a Boaco, cuánto cuesta ir a Juigalpa o si quedan asientos a Managua. ¿Qué querés saber?';

/**
 * contesta un pedido de Alexa. `obtenerSalidas(destino)` devuelve las salidas de la API hacia ese destino; así la
 * lógica se prueba sin red.
 */
export async function responder(pedido, obtenerSalidas, ahora = new Date()) {
  const tipo = pedido?.request?.type;
  if (tipo === 'LaunchRequest') {
    return respuesta(`Hola, soy Andén. ${AYUDA}`, { repregunta: AYUDA });
  }
  if (tipo === 'SessionEndedRequest') return respuesta('', { cerrar: true });
  if (tipo !== 'IntentRequest') return respuesta(AYUDA, { repregunta: AYUDA });

  const intencion = pedido.request.intent?.name;
  if (
    [
      'AMAZON.StopIntent',
      'AMAZON.CancelIntent',
      'AMAZON.NavigateHomeIntent',
    ].includes(intencion)
  ) {
    return respuesta('Buen viaje.', { cerrar: true });
  }
  if (intencion === 'AMAZON.HelpIntent' || intencion === 'AyudaIntent')
    return respuesta(AYUDA, { repregunta: AYUDA });
  if (
    !['ProximoBusIntent', 'PrecioIntent', 'AsientosIntent'].includes(intencion)
  ) {
    return respuesta(`No te entendí. ${AYUDA}`, { repregunta: AYUDA });
  }

  const valor = pedido.request.intent?.slots?.ciudad?.value;
  const ciudad = ciudadDe(valor);
  if (!ciudad) {
    return respuesta(
      '¿A qué ciudad? Puedo decirte de Managua, Boaco y Juigalpa.',
      {
        repregunta: '¿A Managua, Boaco o Juigalpa?',
      },
    );
  }

  let salidas;
  try {
    salidas = await obtenerSalidas(ciudad);
  } catch {
    return respuesta(
      'No pude consultar las salidas ahora. Probá de nuevo en un momento.',
      { cerrar: true },
    );
  }

  if (intencion === 'PrecioIntent') {
    const tarifas = salidas
      .map((s) => s.tarifa)
      .filter((t) => typeof t === 'number');
    if (tarifas.length === 0)
      return respuesta(`No tengo cargada la tarifa a ${ciudad}.`, {
        cerrar: true,
      });
    const minimo = Math.min(...tarifas);
    const maximo = Math.max(...tarifas);
    return respuesta(
      minimo === maximo
        ? `Ir a ${ciudad} cuesta ${minimo} córdobas por persona.`
        : `Ir a ${ciudad} cuesta desde ${minimo} hasta ${maximo} córdobas por persona.`,
      { cerrar: true },
    );
  }

  const proxima = proximaSalida(salidas, ahora);
  if (!proxima)
    return respuesta(`No encontré salidas a ${ciudad} por ahora.`, {
      cerrar: true,
    });
  const fecha = new Date(proxima.salida);
  if (intencion === 'AsientosIntent') {
    return respuesta(
      `En el próximo bus a ${ciudad}, que sale ${diaHablado(fecha, ahora)} a las ${horaHablada(fecha)}, quedan ${proxima.asientosLibres} asientos.`,
      { cerrar: true },
    );
  }
  const precio =
    typeof proxima.tarifa === 'number'
      ? ` Cuesta ${proxima.tarifa} córdobas.`
      : '';
  return respuesta(
    `El próximo bus a ${ciudad} sale ${diaHablado(fecha, ahora)} a las ${horaHablada(fecha)}.${precio} Quedan ${proxima.asientosLibres} asientos.`,
    { cerrar: true },
  );
}
