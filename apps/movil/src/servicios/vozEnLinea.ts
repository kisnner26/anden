import { Directory, File, Paths } from 'expo-file-system';

/** el límite de texto que acepta cada pedido de voz */
export const MAXIMO_POR_TROZO = 180;

/** parte el texto en pedazos que respetan las frases, para que cada uno quepa en un pedido */
export function trozosDeTexto(
  texto: string,
  maximo: number = MAXIMO_POR_TROZO,
): string[] {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (limpio === '') return [];
  const frases = limpio.match(/[^.!?\n]+[.!?]?/g) ?? [limpio];
  const trozos: string[] = [];
  let actual = '';
  const sumar = (pedazo: string) => {
    if (actual !== '' && `${actual} ${pedazo}`.length > maximo) {
      trozos.push(actual);
      actual = pedazo;
    } else {
      actual = actual === '' ? pedazo : `${actual} ${pedazo}`;
    }
  };
  for (const frase of frases) {
    const parte = frase.trim();
    if (parte === '') continue;
    if (parte.length <= maximo) {
      sumar(parte);
      continue;
    }
    // una frase demasiado larga se parte por palabras
    for (const palabra of parte.split(' ')) sumar(palabra);
  }
  if (actual !== '') trozos.push(actual);
  return trozos;
}

/** saca lo que no se debe leer en voz alta: marcas de formato y espacios de más */
export function limpiarParaVoz(texto: string): string {
  return texto
    .replace(/[*_#`>|]/g, ' ')
    .replace(/C\$\s?(\d+)/g, '$1 córdobas')
    .replace(/\s+/g, ' ')
    .trim();
}

/** la dirección de la voz en línea para un trozo de texto, en español */
export function direccionDeVoz(trozo: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es&q=${encodeURIComponent(trozo)}`;
}

let reproductorActual: { remove: () => void; pause: () => void } | null = null;
let generacion = 0;

/** corta la voz en línea que esté sonando */
export function callarVozEnLinea(): void {
  generacion += 1;
  try {
    reproductorActual?.pause();
    reproductorActual?.remove();
  } catch {
    // ya se había liberado
  }
  reproductorActual = null;
}

/**
 * lee el texto con una voz natural bajando el audio trozo a trozo; devuelve falso si no se pudo
 * (sin internet, por ejemplo) para que quien llama use la voz del teléfono
 */
export async function hablarEnLinea(
  texto: string,
  alEmpezar: () => void,
  alTerminar: () => void,
): Promise<boolean> {
  const { createAudioPlayer, setAudioModeAsync } = await import('expo-audio');
  callarVozEnLinea();
  const mia = generacion;
  const trozos = trozosDeTexto(limpiarParaVoz(texto));
  if (trozos.length === 0) return false;
  const carpeta = new Directory(Paths.cache, 'voz');
  if (!carpeta.exists) carpeta.create();
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'duckOthers',
      playsInSilentMode: true,
    });
    // todos los trozos se piden a la vez: mientras suena el primero ya bajan los demás, sin pausas entre frases
    const descargas = trozos.map((trozo, i) =>
      File.downloadFileAsync(
        direccionDeVoz(trozo),
        new File(carpeta, `trozo-${mia}-${i}.mp3`),
        { idempotent: true },
      ),
    );
    // si alguna falla más adelante no debe quedar como rechazo sin atender
    for (const descarga of descargas) descarga.catch(() => undefined);
    let empezo = false;
    for (const descarga of descargas) {
      const archivo = await descarga;
      if (mia !== generacion) return true;
      const reproductor = createAudioPlayer(archivo.uri);
      reproductorActual = reproductor;
      await new Promise<void>((resolver) => {
        const suscripcion = reproductor.addListener(
          'playbackStatusUpdate',
          (estado) => {
            if (estado.didJustFinish) {
              suscripcion.remove();
              resolver();
            }
          },
        );
        if (!empezo) {
          empezo = true;
          alEmpezar();
        }
        reproductor.play();
      });
      reproductor.remove();
      try {
        archivo.delete();
      } catch {
        // el archivo temporal ya no estaba
      }
      if (mia !== generacion) return true;
    }
    if (mia === generacion) alTerminar();
    return true;
  } catch {
    if (mia === generacion) callarVozEnLinea();
    return false;
  }
}
