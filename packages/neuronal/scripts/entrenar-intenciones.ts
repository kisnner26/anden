// entrena el clasificador de intenciones con datos/intenciones.jsonl y guarda src/modelos/intenciones.ts
// uso: node scripts/entrenar-intenciones.ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  Clasificador,
  entrenarClasificador,
  type Frase,
} from '../src/index.ts';

interface FraseConPlantilla extends Frase {
  plantilla: number;
}

const aqui = dirname(fileURLToPath(import.meta.url));
const frases = readFileSync(
  join(aqui, '..', 'datos', 'intenciones.jsonl'),
  'utf8',
)
  .split('\n')
  .filter((l) => l.trim() !== '')
  .map((l) => JSON.parse(l) as FraseConPlantilla);

// para medir de verdad se aparta una de cada cinco plantillas completas: si no, la misma plantilla con otra ciudad
// aparecería en entrenamiento y en prueba y la precisión saldría inflada
const aparte = frases.filter((f) => f.plantilla % 5 === 4);
const propias = frases.filter((f) => f.plantilla % 5 !== 4);
const prueba = entrenarClasificador(propias, { epocas: 80, validacion: 0 });
const clasificador = new Clasificador(prueba.modelo);
const aciertos = aparte.filter(
  (f) => clasificador.clasificar(f.texto)[0]?.etiqueta === f.etiqueta,
).length;
console.log(
  `precisión en plantillas que no vio: ${(100 * aciertos) / aparte.length}% (${aparte.length} frases)`,
);

const final = entrenarClasificador(frases, { epocas: 80, validacion: 0 });
final.modelo.meta.aciertoReal = aciertos / aparte.length;
mkdirSync(join(aqui, '..', 'src', 'modelos'), { recursive: true });
writeFileSync(
  join(aqui, '..', 'src', 'modelos', 'intenciones.ts'),
  `// generado por scripts/entrenar-intenciones.ts: no se edita a mano\nimport type { Modelo } from '../modelo.ts';\n\nexport const MODELO_INTENCIONES: Modelo = ${JSON.stringify(final.modelo)};\n`,
);
console.log(
  `modelo guardado: ${final.parametros} parámetros, ${final.etiquetas.length} intenciones, precisión propia ${(100 * final.precision).toFixed(1)}%`,
);
