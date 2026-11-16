import { crearAzar, mezclar } from './azar';
import { evaluar, type Ejemplo } from './evaluar';
import { avanzar, type Red } from './red';

export interface OpcionesEntrenamiento {
  /** se llama al terminar cada época con cómo va; sirve para dibujar la curva */
  alEpoca?: (info: InfoEpoca) => void;
  epocas?: number;
  /** castigo a los pesos grandes; ayuda a no memorizar */
  l2?: number;
  lote?: number;
  /** épocas seguidas sin mejorar la validación antes de parar; 0 para no parar antes */
  paciencia?: number;
  semilla?: number;
  tasa?: number;
  /** parte de los ejemplos (0 a 1) que se aparta para medir sin entrenar con ella */
  validacion?: number;
}

export interface InfoEpoca {
  epoca: number;
  perdida: number;
  perdidaValidacion: number | null;
  precision: number;
  precisionValidacion: number | null;
}

interface Momentos {
  mPesos: Float32Array;
  mSesgos: Float32Array;
  vPesos: Float32Array;
  vSesgos: Float32Array;
}

const BETA1 = 0.9;
const BETA2 = 0.999;
const EPSILON = 1e-8;

/**
 * entrena la red con el optimizador Adam y devuelve lo que pasó en cada época. Cambia los pesos de la red que recibe;
 * con la misma semilla y los mismos ejemplos da siempre el mismo resultado.
 */
export function entrenar(
  red: Red,
  ejemplos: readonly Ejemplo[],
  opciones: OpcionesEntrenamiento = {},
): InfoEpoca[] {
  const {
    alEpoca,
    epocas = 60,
    l2 = 1e-4,
    lote = 16,
    paciencia = 0,
    semilla = 7,
    tasa = 0.01,
    validacion = 0,
  } = opciones;
  const azar = crearAzar(semilla);
  const mezclados = mezclar(ejemplos, azar);
  const nValidacion = Math.floor(mezclados.length * validacion);
  const apartados = mezclados.slice(0, nValidacion);
  const propios = mezclados.slice(nValidacion);
  const momentos: Momentos[] = red.capas.map((capa) => ({
    mPesos: new Float32Array(capa.pesos.length),
    mSesgos: new Float32Array(capa.sesgos.length),
    vPesos: new Float32Array(capa.pesos.length),
    vSesgos: new Float32Array(capa.sesgos.length),
  }));
  const gradPesos = red.capas.map((capa) => new Float32Array(capa.pesos.length));
  const gradSesgos = red.capas.map((capa) => new Float32Array(capa.sesgos.length));
  const historial: InfoEpoca[] = [];
  let paso = 0;
  let mejor = Infinity;
  let sinMejorar = 0;

  for (let epoca = 1; epoca <= epocas; epoca += 1) {
    const orden = mezclar(propios, azar);
    for (let inicio = 0; inicio < orden.length; inicio += lote) {
      const grupo = orden.slice(inicio, inicio + lote);
      for (let c = 0; c < red.capas.length; c += 1) {
        (gradPesos[c] as Float32Array).fill(0);
        (gradSesgos[c] as Float32Array).fill(0);
      }
      for (let g = 0; g < grupo.length; g += 1) {
        retropropagar(red, grupo[g] as Ejemplo, gradPesos, gradSesgos);
      }
      paso += 1;
      const correccion1 = 1 - BETA1 ** paso;
      const correccion2 = 1 - BETA2 ** paso;
      for (let c = 0; c < red.capas.length; c += 1) {
        const capa = red.capas[c]!;
        const m = momentos[c]!;
        actualizar(capa.pesos, gradPesos[c]!, m.mPesos, m.vPesos, grupo.length, tasa, l2, correccion1, correccion2);
        actualizar(capa.sesgos, gradSesgos[c]!, m.mSesgos, m.vSesgos, grupo.length, tasa, 0, correccion1, correccion2);
      }
    }
    const propia = evaluar(red, propios);
    const aparte = apartados.length > 0 ? evaluar(red, apartados) : null;
    const info: InfoEpoca = {
      epoca,
      perdida: propia.perdida,
      perdidaValidacion: aparte ? aparte.perdida : null,
      precision: propia.precision,
      precisionValidacion: aparte ? aparte.precision : null,
    };
    historial.push(info);
    alEpoca?.(info);
    if (paciencia > 0 && aparte) {
      if (aparte.perdida < mejor - 1e-4) {
        mejor = aparte.perdida;
        sinMejorar = 0;
      } else {
        sinMejorar += 1;
        if (sinMejorar >= paciencia) break;
      }
    }
  }
  return historial;
}

/** suma al gradiente lo que aporta un ejemplo: la derivada de la entropía cruzada con softmax y ReLU, de atrás hacia adelante */
function retropropagar(
  red: Red,
  ejemplo: Ejemplo,
  gradPesos: Float32Array[],
  gradSesgos: Float32Array[],
): void {
  const pasada = avanzar(red, ejemplo.entrada);
  let delta = new Float32Array(pasada.probabilidades);
  delta[ejemplo.clase] = (delta[ejemplo.clase] as number) - 1;
  for (let c = red.capas.length - 1; c >= 0; c -= 1) {
    const capa = red.capas[c]!;
    const entrada = pasada.activaciones[c]!;
    const gp = gradPesos[c]!;
    const gs = gradSesgos[c]!;
    for (let s = 0; s < capa.salidas; s += 1) {
      const d = delta[s] as number;
      gs[s] = (gs[s] as number) + d;
      const base = s * capa.entradas;
      for (let e = 0; e < capa.entradas; e += 1) {
        gp[base + e] = (gp[base + e] as number) + d * (entrada[e] as number);
      }
    }
    if (c > 0) {
      const anterior = new Float32Array(capa.entradas);
      for (let s = 0; s < capa.salidas; s += 1) {
        const d = delta[s] as number;
        const base = s * capa.entradas;
        for (let e = 0; e < capa.entradas; e += 1) {
          anterior[e] = (anterior[e] as number) + (capa.pesos[base + e] as number) * d;
        }
      }
      // la derivada de ReLU: pasa el cambio solo donde la neurona estaba encendida
      for (let e = 0; e < anterior.length; e += 1) {
        if ((entrada[e] as number) <= 0) anterior[e] = 0;
      }
      delta = anterior;
    }
  }
}

function actualizar(
  valores: Float32Array,
  gradiente: Float32Array,
  m: Float32Array,
  v: Float32Array,
  tamanoLote: number,
  tasa: number,
  l2: number,
  correccion1: number,
  correccion2: number,
): void {
  for (let i = 0; i < valores.length; i += 1) {
    const g = (gradiente[i] as number) / tamanoLote + l2 * (valores[i] as number);
    const mi = BETA1 * (m[i] as number) + (1 - BETA1) * g;
    const vi = BETA2 * (v[i] as number) + (1 - BETA2) * g * g;
    m[i] = mi;
    v[i] = vi;
    valores[i] = (valores[i] as number) - (tasa * (mi / correccion1)) / (Math.sqrt(vi / correccion2) + EPSILON);
  }
}
