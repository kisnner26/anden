/** lo que pasa en la app y a lo que Rumbo reacciona: comprar, calificar, pasar un boleto, perder la señal */
export type EventoMascota =
  | { destino: string; tipo: 'reserva' }
  | { tipo: 'calificacion' }
  | { tipo: 'conexion' }
  | { tipo: 'recibido' }
  | { tipo: 'sinConexion' }
  | { tipo: 'transferido' };

type Oyente = (evento: EventoMascota) => void;

const oyentes = new Set<Oyente>();

/** avisa a la mascota que algo pasó; si no hay nadie escuchando, no pasa nada */
export function emitirMascota(evento: EventoMascota): void {
  for (const oyente of [...oyentes]) oyente(evento);
}

/** la mascota se suscribe para reaccionar; devuelve cómo dejar de escuchar */
export function escucharMascota(oyente: Oyente): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}
