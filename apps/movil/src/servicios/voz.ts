import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_VOZ_IA = 'anden.iaVoz';

/** el idioma con el que se escucha y se habla; Nicaragua usa el español latino */
export const IDIOMA_VOZ = 'es-MX';

export type ResultadoEscucha = 'sin-permiso' | 'no-disponible' | 'ok';

export interface OyentesDeVoz {
  /** el texto reconocido hasta ahora; `final` cuando la persona terminó de hablar */
  alTexto: (texto: string, final: boolean) => void;
  /** terminó de escuchar, por silencio o porque se detuvo */
  alTerminar: () => void;
  alFallar: () => void;
}

/** hablar con la IA: escuchar lo que dice la persona y leerle la respuesta con la voz del sistema */
export interface ServicioVoz {
  /** deja de leer la respuesta */
  callar(): Promise<void>;
  /** deja de escuchar y entrega lo que alcanzó a reconocer */
  detener(): Promise<void>;
  /** empieza a escuchar; pide los permisos la primera vez */
  escuchar(oyentes: OyentesDeVoz): Promise<ResultadoEscucha>;
  /** lee el texto en voz alta con la mejor voz en español que tenga el teléfono */
  hablar(texto: string): Promise<void>;
}

export async function leerRespuestaHablada(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_VOZ_IA)) === '1';
  } catch {
    return false;
  }
}

export async function guardarRespuestaHablada(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_VOZ_IA, activa ? '1' : '0');
}

/** la voz en español de mejor calidad: las mejoradas o premium suenan como las de Siri */
export function elegirVoz(
  voces: readonly { identifier: string; language: string; quality?: string }[],
): string | undefined {
  const peso = (calidad?: string) =>
    calidad === 'Premium' ? 3 : calidad === 'Enhanced' ? 2 : 1;
  return voces
    .filter((voz) => voz.language.toLowerCase().startsWith('es'))
    .sort((a, b) => {
      const exacta = (voz: { language: string }) =>
        voz.language.toLowerCase() === IDIOMA_VOZ.toLowerCase() ? 1 : 0;
      return peso(b.quality) - peso(a.quality) || exacta(b) - exacta(a);
    })[0]?.identifier;
}

/**
 * el servicio real: reconocimiento y voz del sistema. Los módulos nativos se cargan al usarlos,
 * así donde no existen (pruebas, web) la app abre igual y la voz queda sin efecto.
 */
export function crearVozDelSistema(): ServicioVoz {
  return {
    async callar() {
      try {
        const Speech = await import('expo-speech');
        await Speech.stop();
      } catch {
        // sin voz del sistema no hay nada que callar
      }
    },
    async detener() {
      try {
        const { ExpoSpeechRecognitionModule } =
          await import('expo-speech-recognition');
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // ya estaba detenido
      }
    },
    async escuchar(oyentes) {
      try {
        const { ExpoSpeechRecognitionModule } =
          await import('expo-speech-recognition');
        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          return 'no-disponible';
        }
        const permiso =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permiso.granted) return 'sin-permiso';
        const suscripciones = [
          ExpoSpeechRecognitionModule.addListener('result', (evento) => {
            const texto = evento.results[0]?.transcript ?? '';
            oyentes.alTexto(texto, evento.isFinal);
          }),
          ExpoSpeechRecognitionModule.addListener('error', () => {
            oyentes.alFallar();
          }),
          ExpoSpeechRecognitionModule.addListener('end', () => {
            for (const suscripcion of suscripciones) suscripcion.remove();
            oyentes.alTerminar();
          }),
        ];
        ExpoSpeechRecognitionModule.start({
          continuous: false,
          interimResults: true,
          lang: IDIOMA_VOZ,
          // el dictado se queda en el teléfono cuando el sistema lo permite
          requiresOnDeviceRecognition:
            ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
        });
        return 'ok';
      } catch {
        return 'no-disponible';
      }
    },
    async hablar(texto) {
      try {
        const Speech = await import('expo-speech');
        await Speech.stop();
        const voz = elegirVoz(await Speech.getAvailableVoicesAsync());
        Speech.speak(texto, {
          language: IDIOMA_VOZ,
          pitch: 1,
          rate: 0.5,
          voice: voz,
        });
      } catch {
        // sin voz del sistema la respuesta igual queda escrita
      }
    },
  };
}
