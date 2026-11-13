import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_VOZ_IA = 'anden.iaVoz';
export const CLAVE_VOZ_EN_LINEA = 'anden.iaVozEnLinea';

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

export interface OpcionesDeHabla {
  alEstado?: (hablando: boolean) => void;
  /** por qué no se pudo oír la respuesta, para decírselo a la persona */
  alProblema?: (motivo: string) => void;
  /** usar la voz natural de internet; el texto de la respuesta sale del teléfono */
  enLinea?: boolean;
}

/** hablar con la IA: escuchar lo que dice la persona y leerle la respuesta con la voz del sistema */
export interface ServicioVoz {
  /** deja de leer la respuesta */
  callar(): Promise<void>;
  /** deja de escuchar y entrega lo que alcanzó a reconocer */
  detener(): Promise<void>;
  /** empieza a escuchar; pide los permisos la primera vez */
  escuchar(oyentes: OyentesDeVoz): Promise<ResultadoEscucha>;
  /**
   * lee el texto en voz alta: con una voz natural en línea si se pide y hay internet, y si no con la
   * mejor voz en español del teléfono; `alEstado` avisa cuándo empieza y cuándo termina de hablar
   */
  hablar(texto: string, opciones?: OpcionesDeHabla): Promise<void>;
  /** carga por adelantado lo necesario para que la primera respuesta hablada no tarde */
  preparar?(): Promise<void>;
}

export async function leerRespuestaHablada(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_VOZ_IA)) === '1';
  } catch {
    return false;
  }
}

export async function leerVozEnLinea(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_VOZ_EN_LINEA)) === '1';
  } catch {
    return false;
  }
}

export async function guardarVozEnLinea(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_VOZ_EN_LINEA, activa ? '1' : '0');
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

let vozElegida: Promise<string | undefined> | null = null;

/** la voz del teléfono se busca una sola vez: listar las voces en cada respuesta la demoraba */
function vozDelTelefono(): Promise<string | undefined> {
  vozElegida ??= import('expo-speech')
    .then(async (Speech) => elegirVoz(await Speech.getAvailableVoicesAsync()))
    .catch(() => undefined);
  return vozElegida;
}

/**
 * deja el audio listo para sonar: por el altavoz, aunque el teléfono esté en silencio y justo
 * después de haber usado el micrófono (si no, iOS deja la sesión en modo grabación y no se oye nada)
 */
async function prepararAudioParaHablar(): Promise<void> {
  // el dictado deja la sesión en grabación con modo "medición", que baja o apaga lo que suena
  try {
    const { ExpoSpeechRecognitionModule } =
      await import('expo-speech-recognition');
    ExpoSpeechRecognitionModule.setCategoryIOS({
      category: 'playback',
      categoryOptions: [],
      mode: 'default',
    });
    ExpoSpeechRecognitionModule.setAudioSessionActiveIOS(true);
  } catch {
    // en Android o sin el módulo no hace falta
  }
  try {
    const { setAudioModeAsync } = await import('expo-audio');
    await setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: 'duckOthers',
      playsInSilentMode: true,
    });
  } catch {
    // sin ajustes de audio se intenta igual
  }
}

/**
 * el servicio real: reconocimiento y voz del sistema. Los módulos nativos se cargan al usarlos,
 * así donde no existen (pruebas, web) la app abre igual y la voz queda sin efecto.
 */
export function crearVozDelSistema(): ServicioVoz {
  return {
    async callar() {
      try {
        const { callarVozEnLinea } = await import('./vozEnLinea');
        callarVozEnLinea();
      } catch {
        // sin voz en línea no hay nada que cortar
      }
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
    async preparar() {
      await Promise.all([
        vozDelTelefono(),
        prepararAudioParaHablar(),
        import('./vozEnLinea').catch(() => undefined),
      ]);
    },
    async hablar(texto, opciones = {}) {
      const { alEstado, enLinea = false } = opciones;
      await prepararAudioParaHablar();
      if (enLinea) {
        try {
          const { hablarEnLinea } = await import('./vozEnLinea');
          const sono = await hablarEnLinea(
            texto,
            () => alEstado?.(true),
            () => alEstado?.(false),
          );
          if (sono) return;
        } catch {
          // se cae a la voz del teléfono
        }
      }
      try {
        const Speech = await import('expo-speech');
        if (await Speech.isSpeakingAsync()) await Speech.stop();
        const { limpiarParaVoz } = await import('./vozEnLinea');
        let arranco = false;
        // si en unos segundos no empezó a sonar, se le dice a la persona en vez de quedar en silencio
        const vigilante = setTimeout(() => {
          if (!arranco) opciones.alProblema?.('sin-inicio');
        }, 4000);
        // sin elegir una voz concreta: el teléfono usa la suya por defecto para el idioma, que siempre existe
        Speech.speak(limpiarParaVoz(texto), {
          language: IDIOMA_VOZ,
          onDone: () => {
            clearTimeout(vigilante);
            alEstado?.(false);
          },
          onError: (error) => {
            clearTimeout(vigilante);
            alEstado?.(false);
            opciones.alProblema?.(error.message || 'error');
          },
          onStart: () => {
            arranco = true;
            clearTimeout(vigilante);
            alEstado?.(true);
          },
          onStopped: () => {
            clearTimeout(vigilante);
            alEstado?.(false);
          },
          pitch: 1,
          rate: 0.5,
          volume: 1,
        });
      } catch (error) {
        alEstado?.(false);
        opciones.alProblema?.(error instanceof Error ? error.message : 'error');
      }
    },
  };
}
