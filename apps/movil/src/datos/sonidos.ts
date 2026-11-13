import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

import abordo from '../../assets/sonidos/abordo.wav';
import arranque from '../../assets/sonidos/arranque.wav';
import bocina from '../../assets/sonidos/bocina.wav';
import bienvenida from '../../assets/sonidos/bienvenida.wav';
import boleto from '../../assets/sonidos/boleto.wav';
import confirmacion from '../../assets/sonidos/confirmacion.wav';
import envio from '../../assets/sonidos/envio.wav';
import favorito from '../../assets/sonidos/favorito.wav';
import fin from '../../assets/sonidos/fin.wav';
import inicio from '../../assets/sonidos/inicio.wav';
import pago from '../../assets/sonidos/pago.wav';
import recordatorio from '../../assets/sonidos/recordatorio.wav';
import salida from '../../assets/sonidos/salida.wav';
import toque from '../../assets/sonidos/toque.wav';

const FUENTES = {
  abordo,
  arranque,
  bienvenida,
  bocina,
  boleto,
  confirmacion,
  envio,
  favorito,
  fin,
  inicio,
  pago,
  recordatorio,
  salida,
  toque,
} as const;

export type NombreSonido = keyof typeof FUENTES;

const reproductores = new Map<NombreSonido, AudioPlayer>();
let modoListo: Promise<void> | null = null;

/** respeta el interruptor de silencio y deja sonar la música de la persona */
function prepararModo(): Promise<void> {
  modoListo ??= setAudioModeAsync({
    interruptionMode: 'mixWithOthers',
    playsInSilentMode: false,
  }).catch(() => undefined);
  return modoListo;
}

/** reproduce un sonido corto desde el inicio; si el audio falla la app sigue en silencio */
export async function reproducirSonido(nombre: NombreSonido): Promise<void> {
  try {
    await prepararModo();
    let reproductor = reproductores.get(nombre);
    if (!reproductor) {
      reproductor = createAudioPlayer(FUENTES[nombre]);
      reproductores.set(nombre, reproductor);
    }
    await reproductor.seekTo(0);
    reproductor.play();
  } catch {
    /* sin sonido no se pierde ninguna función */
  }
}

/** libera los reproductores al salir de la portada */
export function liberarSonidos(): void {
  for (const reproductor of reproductores.values()) {
    try {
      reproductor.remove();
    } catch {
      /* ya liberado */
    }
  }
  reproductores.clear();
  modoListo = null;
}
