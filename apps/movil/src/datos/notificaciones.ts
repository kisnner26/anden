import {
  SchedulableTriggerInputTypes,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Linking } from 'react-native';

export type PermisoNotificaciones = 'concedido' | 'negado' | 'sin-preguntar';

export interface RecordatorioPorProgramar {
  anden: number;
  cuando: Date;
  destino: string;
  texto: { cuerpo: string; titulo: string };
}

/** con la app abierta el aviso también se muestra, sin sonido */
export function mostrarAvisosConLaAppAbierta(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function aPermiso(estado: {
  canAskAgain: boolean;
  granted: boolean;
}): PermisoNotificaciones {
  if (estado.granted) return 'concedido';
  return estado.canAskAgain ? 'sin-preguntar' : 'negado';
}

export async function leerPermiso(): Promise<PermisoNotificaciones> {
  return aPermiso(await getPermissionsAsync());
}

/** pide el permiso del sistema; solo se llama cuando la persona activa los avisos */
export async function pedirPermiso(): Promise<PermisoNotificaciones> {
  const estado = await requestPermissionsAsync();
  return estado.granted ? 'concedido' : 'negado';
}

/** programa un aviso local en el teléfono y devuelve su identificador */
export function programarRecordatorio(
  recordatorio: RecordatorioPorProgramar,
): Promise<string> {
  return scheduleNotificationAsync({
    content: {
      body: recordatorio.texto.cuerpo,
      title: recordatorio.texto.titulo,
    },
    trigger: {
      date: recordatorio.cuando,
      type: SchedulableTriggerInputTypes.DATE,
    },
  });
}

export function cancelarRecordatorio(identificador: string): Promise<void> {
  return cancelScheduledNotificationAsync(identificador);
}

export function abrirAjustesDelSistema(): Promise<void> {
  return Linking.openSettings();
}
