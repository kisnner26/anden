// panel local para ver, entrenar y probar la red del asistente: node servidor.ts  ->  http://127.0.0.1:4777
import { readFileSync, writeFileSync } from 'node:fs';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

import { Clasificador, MODELO_INTENCIONES, type Modelo } from '@anden/neuronal';

import {
  agregarFrase,
  quitarFrase,
  RUTA_MODELO,
  todasLasFrases,
  validarFrase,
} from './datos.ts';

const PUERTO = Number(process.env.PUERTO ?? 4777);
const aqui = dirname(fileURLToPath(import.meta.url));
const ESTATICOS: Record<string, [string, string]> = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/estilo.css': ['estilo.css', 'text/css; charset=utf-8'],
};

interface Resultado {
  etiquetas: string[];
  historial: unknown[];
  matriz: number[][];
  modelo: Modelo;
  parametros: number;
  precision: number;
  precisionPorClase: (number | null)[];
}

let ultimo: Resultado | null = null;
let entrenando = false;

function json(res: ServerResponse, codigo: number, cuerpo: unknown): void {
  res.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(cuerpo));
}

/** solo se atiende a quien abre el panel desde este mismo equipo: otra página web no puede mandarle órdenes */
function esDeConfianza(req: IncomingMessage): boolean {
  const host = req.headers.host ?? '';
  if (host !== `127.0.0.1:${PUERTO}` && host !== `localhost:${PUERTO}`)
    return false;
  const origen = req.headers.origin;
  return origen === undefined || origen === `http://${host}`;
}

function leerCuerpo(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolver, rechazar) => {
    let texto = '';
    req.on('data', (trozo: Buffer) => {
      texto += trozo.toString();
      if (texto.length > 10_000) {
        rechazar(new Error('cuerpo muy grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolver(texto === '' ? {} : JSON.parse(texto));
      } catch {
        rechazar(new Error('JSON inválido'));
      }
    });
  });
}

function numero(
  valor: string | null,
  porDefecto: number,
  minimo: number,
  maximo: number,
): number {
  const n = Number(valor);
  return valor !== null && Number.isFinite(n)
    ? Math.min(maximo, Math.max(minimo, n))
    : porDefecto;
}

function entrenar(url: URL, res: ServerResponse): void {
  if (entrenando)
    return json(res, 409, { error: 'ya hay un entrenamiento en marcha' });
  entrenando = true;
  const p = url.searchParams;
  const opciones = {
    dimension: numero(p.get('dimension'), 512, 64, 4096),
    epocas: numero(p.get('epocas'), 80, 1, 400),
    ocultas: [numero(p.get('oculta'), 32, 4, 256)],
    semilla: numero(p.get('semilla'), 7, 1, 100000),
    tasa: numero(p.get('tasa'), 0.01, 0.0001, 0.1),
  };
  res.writeHead(200, {
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
  });
  const enviar = (evento: string, datos: unknown) =>
    res.write(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`);
  const frases = todasLasFrases().map(({ etiqueta, plantilla, texto }) => ({
    etiqueta,
    ...(plantilla !== undefined ? { plantilla } : {}),
    texto,
  }));
  const hilo = new Worker(new URL('./trabajador.ts', import.meta.url), {
    workerData: { frases, opciones },
  });
  hilo.on(
    'message',
    (m: { info?: unknown; resultado?: Resultado; tipo: string }) => {
      if (m.tipo === 'epoca') enviar('epoca', m.info);
      if (m.tipo === 'midiendo') enviar('midiendo', {});
      if (m.tipo === 'fin' && m.resultado) {
        ultimo = m.resultado;
        enviar('fin', {
          parametros: m.resultado.parametros,
          precision: m.resultado.precision,
        });
      }
    },
  );
  const terminar = () => {
    entrenando = false;
    res.end();
  };
  hilo.on('error', (e) => {
    enviar('error', { mensaje: e.message });
    terminar();
  });
  hilo.on('exit', terminar);
  res.on('close', () => void hilo.terminate());
}

function clasificadorActual(): Clasificador {
  return new Clasificador(ultimo?.modelo ?? MODELO_INTENCIONES);
}

/** el tamaño de cada capa y cuánto pesa cada neurona oculta, para dibujar la red */
function estructuraDeLaRed(modelo: Modelo) {
  const capas = modelo.capas.map((capa) => {
    const fuerza: number[] = [];
    for (let s = 0; s < Math.min(capa.salidas, 40); s += 1) {
      let suma = 0;
      for (let e = 0; e < capa.entradas; e += 1)
        suma += Math.abs(capa.pesos[s * capa.entradas + e] as number);
      fuerza.push(suma / capa.entradas);
    }
    // la última capa se manda completa (pocas conexiones) para dibujar cada línea con su peso
    const pesos =
      capa.entradas <= 64 && capa.salidas <= 40
        ? Array.from({ length: capa.salidas }, (_, s) =>
            capa.pesos.slice(s * capa.entradas, (s + 1) * capa.entradas),
          )
        : null;
    return { entradas: capa.entradas, fuerza, pesos, salidas: capa.salidas };
  });
  return {
    capas,
    dimension: modelo.dimension,
    etiquetas: modelo.etiquetas,
    meta: modelo.meta,
  };
}

async function atender(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!esDeConfianza(req))
    return json(res, 403, { error: 'solo desde este equipo' });
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const ruta = url.pathname;
  if (req.method === 'GET' && ESTATICOS[ruta]) {
    const [archivo, tipo] = ESTATICOS[ruta] as [string, string];
    res.writeHead(200, { 'Content-Type': tipo });
    return void res.end(readFileSync(join(aqui, 'publico', archivo)));
  }
  if (req.method === 'GET' && ruta === '/api/estado') {
    const frases = todasLasFrases();
    const porEtiqueta: Record<string, number> = {};
    for (const f of frases)
      porEtiqueta[f.etiqueta] = (porEtiqueta[f.etiqueta] ?? 0) + 1;
    const modelo = ultimo?.modelo ?? MODELO_INTENCIONES;
    return json(res, 200, {
      entrenando,
      frases: frases.length,
      matriz: ultimo?.matriz ?? null,
      modelo: estructuraDeLaRed(modelo),
      parametros: ultimo?.parametros ?? null,
      porEtiqueta,
      precision: ultimo?.precision ?? null,
      precisionPorClase: ultimo?.precisionPorClase ?? null,
      sinExportar: ultimo !== null,
    });
  }
  if (req.method === 'GET' && ruta === '/api/frases')
    return json(res, 200, todasLasFrases());
  if (req.method === 'GET' && ruta === '/api/entrenar')
    return entrenar(url, res);
  try {
    if (req.method === 'POST' && ruta === '/api/frases') {
      const frase = validarFrase(await leerCuerpo(req));
      if (!frase) return json(res, 400, { error: 'frase inválida' });
      agregarFrase(frase);
      return json(res, 201, frase);
    }
    if (req.method === 'DELETE' && ruta === '/api/frases') {
      const frase = validarFrase(await leerCuerpo(req));
      if (!frase || !quitarFrase(frase))
        return json(res, 404, { error: 'no es una frase propia' });
      return json(res, 200, frase);
    }
    if (req.method === 'POST' && ruta === '/api/probar') {
      const cuerpo = (await leerCuerpo(req)) as { texto?: unknown };
      if (typeof cuerpo.texto !== 'string' || cuerpo.texto.length > 160)
        return json(res, 400, { error: 'texto inválido' });
      return json(
        res,
        200,
        clasificadorActual().clasificar(cuerpo.texto).slice(0, 5),
      );
    }
    if (req.method === 'POST' && ruta === '/api/exportar') {
      if (!ultimo)
        return json(res, 409, { error: 'primero entrená un modelo' });
      writeFileSync(
        RUTA_MODELO,
        `// generado por scripts/entrenar-intenciones.ts: no se edita a mano\nimport type { Modelo } from '../modelo.ts';\n\nexport const MODELO_INTENCIONES: Modelo = ${JSON.stringify(ultimo.modelo)};\n`,
      );
      return json(res, 200, {
        archivo: 'packages/neuronal/src/modelos/intenciones.ts',
      });
    }
  } catch (e) {
    return json(res, 400, { error: (e as Error).message });
  }
  json(res, 404, { error: 'no existe' });
}

createServer((req, res) => void atender(req, res)).listen(
  PUERTO,
  '127.0.0.1',
  () => {
    console.log(`Panel de la red del asistente: http://127.0.0.1:${PUERTO}`);
  },
);
