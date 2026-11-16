// puente entre la app de Andén y Claude Code de esta Mac: node servidor.ts
// la app manda la pregunta por la red local con un código de emparejamiento; el puente se la pasa a `claude -p`
// (con tu suscripción, sin herramientas ni archivos) y devuelve el texto
import { randomBytes } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { networkInterfaces, homedir } from 'node:os';
import { join } from 'node:path';

import { preguntarAClaude, validarPedido } from './claude.ts';
import {
  codigoDeCabecera,
  codigoValido,
  crearLimite,
  esRedLocal,
} from './seguridad.ts';

const PUERTO = Number(process.env.PUERTO ?? 4780);
const CARPETA = join(homedir(), '.anden');
const ARCHIVO = join(CARPETA, 'puente.json');

function leerCodigo(): string {
  if (existsSync(ARCHIVO)) {
    try {
      const { codigo } = JSON.parse(readFileSync(ARCHIVO, 'utf8')) as {
        codigo?: string;
      };
      if (typeof codigo === 'string' && /^[0-9a-f]{48}$/.test(codigo))
        return codigo;
    } catch {
      /* si el archivo se dañó se crea otro */
    }
  }
  const codigo = randomBytes(24).toString('hex');
  mkdirSync(CARPETA, { recursive: true });
  writeFileSync(ARCHIVO, JSON.stringify({ codigo }), { mode: 0o600 });
  chmodSync(ARCHIVO, 0o600);
  return codigo;
}

const CODIGO = leerCodigo();
const permitido = crearLimite(20);
let ocupado = false;

function json(res: ServerResponse, codigo: number, cuerpo: unknown): void {
  res.writeHead(codigo, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(cuerpo));
}

function leerCuerpo(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolver, rechazar) => {
    let texto = '';
    req.on('data', (t: Buffer) => {
      texto += t.toString();
      if (texto.length > 20_000) {
        rechazar(new Error('cuerpo muy grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolver(JSON.parse(texto));
      } catch {
        rechazar(new Error('JSON inválido'));
      }
    });
  });
}

async function atender(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!esRedLocal(req.socket.remoteAddress))
    return json(res, 403, { error: 'solo desde la red local' });
  if (!codigoValido(codigoDeCabecera(req.headers.authorization), CODIGO))
    return json(res, 401, { error: 'código incorrecto' });
  if (!permitido())
    return json(res, 429, { error: 'demasiados pedidos, esperá un minuto' });
  const ruta = new URL(req.url ?? '/', 'http://puente').pathname;
  if (req.method === 'GET' && ruta === '/estado')
    return json(res, 200, { ok: true });
  if (req.method === 'POST' && ruta === '/preguntar') {
    if (ocupado)
      return json(res, 429, {
        error: 'Claude está respondiendo otra pregunta',
      });
    let pedido;
    try {
      pedido = validarPedido(await leerCuerpo(req));
    } catch (e) {
      return json(res, 400, { error: (e as Error).message });
    }
    if (!pedido) return json(res, 400, { error: 'pedido inválido' });
    ocupado = true;
    try {
      return json(res, 200, { texto: await preguntarAClaude(pedido) });
    } catch (e) {
      return json(res, 502, { error: (e as Error).message });
    } finally {
      ocupado = false;
    }
  }
  json(res, 404, { error: 'no existe' });
}

createServer((req, res) => void atender(req, res)).listen(
  PUERTO,
  '0.0.0.0',
  () => {
    const direcciones = Object.values(networkInterfaces())
      .flat()
      .filter((i) => i && i.family === 'IPv4' && !i.internal)
      .map((i) => i!.address);
    console.log('Puente de Claude Code para Andén');
    console.log(`Código de emparejamiento: ${CODIGO}`);
    for (const d of direcciones)
      console.log(`Dirección: http://${d}:${PUERTO}`);
    console.log(
      'En la app: Ajustes > Claude desde tu Mac. Solo responde a equipos de tu red local y con ese código.',
    );
  },
);
