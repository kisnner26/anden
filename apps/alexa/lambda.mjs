// la entrada de AWS Lambda (o Alexa-hosted): comprueba que el pedido sea de esta habilidad y reciente, y llama a la lógica
import { responder } from './habilidad.mjs';

const API = process.env.ANDEN_API ?? 'https://api.anden.example';
const TOLERANCIA_MS = 150_000;

/** las salidas de la API hacia una ciudad */
async function obtenerSalidas(destino) {
  const respuesta = await fetch(
    `${API}/v1/salidas?destino=${encodeURIComponent(destino)}`,
    {
      signal: AbortSignal.timeout(6000),
    },
  );
  if (!respuesta.ok) throw new Error(`api ${respuesta.status}`);
  return (await respuesta.json()).salidas;
}

/** Alexa pide rechazar pedidos de otra habilidad y los que llegan con una fecha vieja (repetidos por alguien) */
export function pedidoValido(
  pedido,
  idEsperado = process.env.ALEXA_SKILL_ID,
  ahora = Date.now(),
) {
  const id =
    pedido?.session?.application?.applicationId ??
    pedido?.context?.System?.application?.applicationId;
  if (!idEsperado || id !== idEsperado) return false;
  const marca = Date.parse(pedido?.request?.timestamp ?? '');
  return Number.isFinite(marca) && Math.abs(ahora - marca) <= TOLERANCIA_MS;
}

export async function handler(evento) {
  if (!pedidoValido(evento)) throw new Error('Pedido no válido');
  return responder(evento, obtenerSalidas);
}
