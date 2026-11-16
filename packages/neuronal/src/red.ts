import { crearAzar, normal } from './azar';

/** una capa densa: cada salida es la suma de las entradas por sus pesos más un sesgo */
export interface Capa {
  entradas: number;
  /** pesos[salida * entradas + entrada] */
  pesos: Float32Array;
  salidas: number;
  sesgos: Float32Array;
}

/** una red de capas densas: las ocultas usan ReLU y la última devuelve probabilidades con softmax */
export interface Red {
  capas: Capa[];
}

/** crea una red con pesos al azar (inicialización de He) y sesgos en cero */
export function crearRed(
  entradas: number,
  ocultas: readonly number[],
  salidas: number,
  semilla = 1,
): Red {
  const azar = crearAzar(semilla);
  const tamanos = [entradas, ...ocultas, salidas];
  const capas: Capa[] = [];
  for (let i = 0; i + 1 < tamanos.length; i += 1) {
    const e = tamanos[i] as number;
    const s = tamanos[i + 1] as number;
    const pesos = new Float32Array(e * s);
    const escala = Math.sqrt(2 / e);
    for (let k = 0; k < pesos.length; k += 1) pesos[k] = normal(azar) * escala;
    capas.push({ entradas: e, pesos, salidas: s, sesgos: new Float32Array(s) });
  }
  return { capas };
}

/** las probabilidades a partir de números cualquiera; resta el máximo para que no se desborde */
export function softmax(valores: Float32Array): Float32Array {
  let maximo = -Infinity;
  for (let i = 0; i < valores.length; i += 1) maximo = Math.max(maximo, valores[i] as number);
  const salida = new Float32Array(valores.length);
  let suma = 0;
  for (let i = 0; i < valores.length; i += 1) {
    const e = Math.exp((valores[i] as number) - maximo);
    salida[i] = e;
    suma += e;
  }
  for (let i = 0; i < salida.length; i += 1) salida[i] = (salida[i] as number) / suma;
  return salida;
}

/** lo que calcula cada capa al avanzar: se guarda porque el entrenamiento lo necesita para volver atrás */
export interface Pasada {
  /** la entrada de cada capa, más al final la salida de la última */
  activaciones: Float32Array[];
  probabilidades: Float32Array;
}

export function avanzar(red: Red, entrada: Float32Array): Pasada {
  const activaciones: Float32Array[] = [entrada];
  let actual = entrada;
  for (let c = 0; c < red.capas.length; c += 1) {
    const capa = red.capas[c] as Capa;
    const siguiente = new Float32Array(capa.salidas);
    for (let s = 0; s < capa.salidas; s += 1) {
      let suma = capa.sesgos[s] as number;
      const base = s * capa.entradas;
      for (let e = 0; e < capa.entradas; e += 1) {
        suma += (capa.pesos[base + e] as number) * (actual[e] as number);
      }
      siguiente[s] = suma;
    }
    const ultima = c === red.capas.length - 1;
    if (!ultima) {
      for (let s = 0; s < siguiente.length; s += 1) {
        if ((siguiente[s] as number) < 0) siguiente[s] = 0;
      }
    }
    activaciones.push(siguiente);
    actual = siguiente;
  }
  const probabilidades = softmax(actual);
  activaciones[activaciones.length - 1] = probabilidades;
  return { activaciones, probabilidades };
}

/** las probabilidades de cada clase para una entrada */
export function predecir(red: Red, entrada: Float32Array): Float32Array {
  return avanzar(red, entrada).probabilidades;
}

/** cuántos pesos y sesgos tiene la red: cuánto pesa y cuánto cuesta calcularla */
export function contarParametros(red: Red): number {
  let total = 0;
  for (let c = 0; c < red.capas.length; c += 1) {
    const capa = red.capas[c] as Capa;
    total += capa.pesos.length + capa.sesgos.length;
  }
  return total;
}
