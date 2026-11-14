import type { SenalDeAyuda } from './senalesDeAyuda';
import { t } from '@/textos/t';

/** la ayuda lista para mostrar de inmediato según en qué se trabó la persona; la IA la mejora si está disponible */
export function ayudaPorDefecto(motivo: SenalDeAyuda): string {
  return t(`mascota.ayuda.${motivo}`);
}

/** lo que se le cuenta a la IA sobre en qué anda la persona, sin datos personales */
export function descripcionDelApuro(motivo: SenalDeAyuda): string {
  switch (motivo) {
    case 'errorIngreso':
      return 'no logra iniciar sesión: ya se equivocó varias veces con el usuario o la contraseña';
    case 'errorFormulario':
      return 'un formulario no la deja avanzar porque faltan datos o están mal escritos';
    case 'reservaFallida':
      return 'no pudo reservar porque el asiento que quería se ocupó justo antes';
    case 'sinConexion':
      return 'se quedó sin internet y la app muestra solo lo guardado';
    case 'toquesRepetidos':
      return 'está tocando varias veces el mismo lugar de la pantalla porque algo no responde';
  }
}
