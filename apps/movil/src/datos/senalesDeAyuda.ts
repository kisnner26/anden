/** lo que le avisa a Rumbo que la persona se está trabando: un error al ingresar, un formulario que no pasa, una reserva que falla */
export type SenalDeAyuda =
  | 'errorFormulario'
  | 'errorIngreso'
  | 'reservaFallida'
  | 'sinConexion'
  | 'toquesRepetidos';

type Oyente = (senal: SenalDeAyuda) => void;

const oyentes = new Set<Oyente>();

/** una pantalla avisa que algo le salió mal a la persona; si nadie escucha, no pasa nada */
export function emitirSenal(senal: SenalDeAyuda): void {
  for (const oyente of [...oyentes]) oyente(senal);
}

/** Rumbo se suscribe para juntar las señales; devuelve cómo dejar de escuchar */
export function escucharSenales(oyente: Oyente): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}
