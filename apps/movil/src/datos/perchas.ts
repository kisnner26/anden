import { useEffect, useRef, type RefObject } from 'react';

/** lo único que se le pide a una vista para poder posarse sobre ella */
export interface VistaMedible {
  measureInWindow: (
    alTerminar: (x: number, y: number, ancho: number, alto: number) => void,
  ) => void;
}

/** un lugar de la pantalla donde la mascota se puede subir: el rectángulo de una tarjeta, en coordenadas de la ventana */
export interface Rectangulo {
  alto: number;
  ancho: number;
  x: number;
  y: number;
}

export interface Percha {
  ref: RefObject<VistaMedible | null>;
  rect: Rectangulo;
}

const registradas = new Set<RefObject<VistaMedible | null>>();

/** una tarjeta se anuncia como lugar donde posarse mientras está en pantalla; devuelve cómo retirarse */
export function registrarPercha(
  ref: RefObject<VistaMedible | null>,
): () => void {
  registradas.add(ref);
  return () => {
    registradas.delete(ref);
  };
}

/** cuántas perchas hay ahora mismo; sirve para las pruebas */
export function cantidadDePerchas(): number {
  return registradas.size;
}

/** el rectángulo de una percha en la ventana; nulo si ya no está montada */
export function medirPercha(
  ref: RefObject<VistaMedible | null>,
): Promise<Rectangulo | null> {
  return new Promise((resolver) => {
    const vista = ref.current;
    if (!vista || typeof vista.measureInWindow !== 'function') {
      resolver(null);
      return;
    }
    vista.measureInWindow((x, y, ancho, alto) => {
      resolver(
        Number.isFinite(x) && ancho > 0 && alto > 0
          ? { alto, ancho, x, y }
          : null,
      );
    });
  });
}

/** mide hasta `maximo` perchas al azar, para no medir toda la pantalla cada vez */
export async function medirPerchas(maximo = 10): Promise<Percha[]> {
  const todas = [...registradas].sort(() => Math.random() - 0.5);
  const medidas = await Promise.all(
    todas.slice(0, maximo).map(async (ref) => {
      const rect = await medirPercha(ref);
      return rect ? { ref, rect } : null;
    }),
  );
  return medidas.filter((p): p is Percha => p !== null);
}

/** para las tarjetas: devuelve la referencia que hay que ponerle a la vista y la registra mientras viva */
export function usePercha(): (vista: VistaMedible | null) => void {
  const ref = useRef<VistaMedible | null>(null);
  useEffect(() => registrarPercha(ref), []);
  return (vista) => {
    ref.current = vista;
  };
}

/** de las perchas medidas, las que de verdad sirven para pararse encima */
export function perchasUtiles(
  perchas: readonly Percha[],
  limites: {
    altoMascota: number;
    anchoVentana: number;
    anchoMascota: number;
    pisoY: number;
    topeY: number;
  },
): Percha[] {
  return perchas.filter(({ rect }) => {
    const sobraAncho = rect.ancho >= limites.anchoMascota + 40;
    const dentro =
      rect.x >= 0 && rect.x + rect.ancho <= limites.anchoVentana + 1;
    // el borde de arriba tiene que dejar lugar para que ella quepa encima y quedar por encima del piso
    const alturaOk =
      rect.y >= limites.topeY + limites.altoMascota && rect.y <= limites.pisoY;
    return sobraAncho && dentro && alturaOk;
  });
}
