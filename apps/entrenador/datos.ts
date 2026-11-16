import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Frase } from '@anden/neuronal';

const aqui = dirname(fileURLToPath(import.meta.url));
const carpeta = join(aqui, '..', '..', 'packages', 'neuronal');
export const RUTA_BASE = join(carpeta, 'datos', 'intenciones.jsonl');
export const RUTA_PROPIAS = join(carpeta, 'datos', 'propias.jsonl');
export const RUTA_MODELO = join(carpeta, 'src', 'modelos', 'intenciones.ts');

export interface FraseDelPanel extends Frase {
  /** viene del conjunto generado (no se borra desde el panel) o la agregó la persona */
  origen: 'base' | 'propia';
}

function leer(ruta: string, origen: FraseDelPanel['origen']): FraseDelPanel[] {
  if (!existsSync(ruta)) return [];
  return readFileSync(ruta, 'utf8')
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => {
      const f = JSON.parse(l) as Frase;
      return { etiqueta: f.etiqueta, origen, texto: f.texto };
    });
}

/** todas las frases: las generadas de las plantillas y las que se agregaron desde el panel */
export function todasLasFrases(): FraseDelPanel[] {
  return [...leer(RUTA_BASE, 'base'), ...leer(RUTA_PROPIAS, 'propia')];
}

/** limpia lo que llega del navegador: textos cortos, sin saltos de línea y con una etiqueta válida */
export function validarFrase(cruda: unknown): Frase | null {
  if (typeof cruda !== 'object' || cruda === null) return null;
  const { etiqueta, texto } = cruda as Record<string, unknown>;
  if (typeof etiqueta !== 'string' || typeof texto !== 'string') return null;
  const limpia = texto.replace(/\s+/g, ' ').trim();
  if (limpia.length < 2 || limpia.length > 160) return null;
  if (!/^[a-z_]{2,30}$/.test(etiqueta)) return null;
  return { etiqueta, texto: limpia };
}

export function agregarFrase(frase: Frase): void {
  appendFileSync(RUTA_PROPIAS, `${JSON.stringify(frase)}\n`);
}

/** quita una frase propia (la primera que coincida); falso si no estaba */
export function quitarFrase(frase: Frase): boolean {
  const propias = leer(RUTA_PROPIAS, 'propia');
  const indice = propias.findIndex((f) => f.etiqueta === frase.etiqueta && f.texto === frase.texto);
  if (indice < 0) return false;
  propias.splice(indice, 1);
  writeFileSync(
    RUTA_PROPIAS,
    propias.map((f) => JSON.stringify({ etiqueta: f.etiqueta, texto: f.texto })).join('\n') + (propias.length > 0 ? '\n' : ''),
  );
  return true;
}
