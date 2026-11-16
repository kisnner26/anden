// corre el entrenamiento en un hilo aparte para que el panel siga respondiendo y muestre cada época en vivo
import { parentPort, workerData } from 'node:worker_threads';

import {
  entrenarClasificador,
  type Frase,
  type OpcionesClasificador,
} from '@anden/neuronal';

interface FraseDePlantilla extends Frase {
  plantilla?: number;
}

interface Pedido {
  frases: FraseDePlantilla[];
  opciones: OpcionesClasificador;
}

const { frases, opciones } = workerData as Pedido;
const resultado = entrenarClasificador(frases, {
  ...opciones,
  alEpoca: (info) => parentPort?.postMessage({ info, tipo: 'epoca' }),
});

// la medida honesta: se aparta una de cada cinco plantillas completas, se entrena sin ellas y se prueba con ellas
const aparte = frases.filter(
  (f) => f.plantilla !== undefined && f.plantilla % 5 === 4,
);
if (aparte.length > 0) {
  parentPort?.postMessage({ tipo: 'midiendo' });
  const propias = frases.filter(
    (f) => !(f.plantilla !== undefined && f.plantilla % 5 === 4),
  );
  const prueba = new Clasificador(
    entrenarClasificador(propias, { ...opciones, validacion: 0 }).modelo,
  );
  const aciertos = aparte.filter(
    (f) => prueba.clasificar(f.texto)[0]?.etiqueta === f.etiqueta,
  ).length;
  resultado.modelo.meta.aciertoReal = aciertos / aparte.length;
}

parentPort?.postMessage({
  resultado: {
    etiquetas: resultado.etiquetas,
    historial: resultado.historial,
    matriz: resultado.matriz,
    modelo: resultado.modelo,
    parametros: resultado.parametros,
    precision: resultado.precision,
    precisionPorClase: resultado.precisionPorClase,
  },
  tipo: 'fin',
});
