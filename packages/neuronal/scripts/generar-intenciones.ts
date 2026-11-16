// genera datos/intenciones.jsonl a partir de datos/plantillas.json: cada plantilla se llena con cada ciudad
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CIUDADES = ['Managua', 'Boaco', 'Juigalpa'];
const aqui = dirname(fileURLToPath(import.meta.url));
const plantillas = JSON.parse(readFileSync(join(aqui, '..', 'datos', 'plantillas.json'), 'utf8')) as Record<string, string[]>;

const lineas: string[] = [];
for (const [etiqueta, lista] of Object.entries(plantillas)) {
  for (const plantilla of lista) {
    const textos = plantilla.includes('{c}')
      ? CIUDADES.map((c) => plantilla.replace('{c}', c.toLowerCase()))
      : [plantilla];
    for (const texto of textos) lineas.push(JSON.stringify({ etiqueta, texto }));
  }
}
writeFileSync(join(aqui, '..', 'datos', 'intenciones.jsonl'), `${lineas.join('\n')}\n`);
console.log(`listo: ${lineas.length} frases`);
