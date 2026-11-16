// corre el entrenamiento en un hilo aparte para que el panel siga respondiendo y muestre cada época en vivo
import { parentPort, workerData } from 'node:worker_threads';

import {
  entrenarClasificador,
  type Frase,
  type OpcionesClasificador,
} from '@anden/neuronal';

interface Pedido {
  frases: Frase[];
  opciones: OpcionesClasificador;
}

const { frases, opciones } = workerData as Pedido;
const resultado = entrenarClasificador(frases, {
  ...opciones,
  alEpoca: (info) => parentPort?.postMessage({ info, tipo: 'epoca' }),
});
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
