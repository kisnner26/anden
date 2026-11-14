/** en qué momento está un viaje para la Live Activity: define su color y qué muestra */
export type FaseActividad =
  'abordando' | 'atrasado' | 'espera' | 'llego' | 'ruta';

/** pasa el estado del viaje de la app a la fase de la actividad en vivo */
export function faseDeActividad(
  estadoViaje: string | undefined,
): FaseActividad {
  switch (estadoViaje) {
    case 'abordando':
      return 'abordando';
    case 'atrasado':
      return 'atrasado';
    case 'en-ruta':
      return 'ruta';
    case 'llego':
      return 'llego';
    default:
      return 'espera';
  }
}
