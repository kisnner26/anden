import { aRed, type Modelo } from './modelo.ts';
import { predecir, type Red } from './red.ts';
import { vectorizar } from './vectorizar.ts';

export interface Prediccion {
  etiqueta: string;
  probabilidad: number;
}

/** clasifica un texto con un modelo entrenado: devuelve las clases de la más a la menos probable */
export class Clasificador {
  private readonly modelo: Modelo;
  private readonly red: Red;

  constructor(modelo: Modelo) {
    this.modelo = modelo;
    this.red = aRed(modelo);
  }

  get etiquetas(): readonly string[] {
    return this.modelo.etiquetas;
  }

  clasificar(texto: string): Prediccion[] {
    const p = predecir(this.red, vectorizar(texto, this.modelo.dimension));
    return this.modelo.etiquetas
      .map((etiqueta, i) => ({ etiqueta, probabilidad: p[i] as number }))
      .sort((a, b) => b.probabilidad - a.probabilidad);
  }

  /** la clase más probable si la red está lo bastante segura; nulo si no, para no contestar a ciegas */
  mejor(texto: string, umbral = 0.5): Prediccion | null {
    const [primera] = this.clasificar(texto);
    return primera && primera.probabilidad >= umbral ? primera : null;
  }
}
