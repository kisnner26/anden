export interface PasoDeGuia {
  clave: 'perfil' | 'primerViaje' | 'pasajeros' | 'cerrarViaje';
  hecho: boolean;
}

export interface EstadoDeGuia {
  cerrados: number;
  conFoto: boolean;
  nombreListo: boolean;
  viajesPublicados: number;
  /** ya vio la pestaña de pasajeros y encomiendas, o ya tiene pasajeros o encomiendas */
  vioPasajeros: boolean;
}

/** los pasos de la guía para quien empieza como conductor y cuáles ya cumplió */
export function pasosDeGuia(estado: EstadoDeGuia): PasoDeGuia[] {
  return [
    { clave: 'perfil', hecho: estado.conFoto && estado.nombreListo },
    { clave: 'primerViaje', hecho: estado.viajesPublicados > 0 },
    { clave: 'pasajeros', hecho: estado.vioPasajeros },
    { clave: 'cerrarViaje', hecho: estado.cerrados > 0 },
  ];
}

/** cuántos pasos lleva cumplidos, de 0 a 1 */
export function avanceDeGuia(pasos: readonly PasoDeGuia[]): number {
  return pasos.length === 0
    ? 0
    : pasos.filter((paso) => paso.hecho).length / pasos.length;
}
