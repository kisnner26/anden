import {
  SchedulableTriggerInputTypes,
  addNotificationResponseReceivedListener,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationCategoryAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Linking } from 'react-native';

import { t } from '@/textos/t';

export type PermisoNotificaciones = 'concedido' | 'negado' | 'sin-preguntar';

export interface RecordatorioPorProgramar {
  puntoEncuentro: string;
  cuando: Date;
  destino: string;
  texto: { cuerpo: string; titulo: string };
}

export const CATEGORIA_RECORDATORIO = 'recordatorio';
export const ACCION_VER = 'ver-boleto';
export const ACCION_POSPONER = 'posponer';
export const MINUTOS_POSPUESTO = 10;

/**
 * registra las acciones del recordatorio; el Apple Watch y las pulseras
 * enlazadas las muestran solas, sin una app propia en el reloj
 */
export function registrarAccionesDeAvisos(): void {
  setNotificationCategoryAsync(CATEGORIA_RECORDATORIO, [
    {
      buttonTitle: t('avisos.accionVerBoleto'),
      identifier: ACCION_VER,
      options: { opensAppToForeground: true },
    },
    {
      buttonTitle: t('avisos.accionPosponer'),
      identifier: ACCION_POSPONER,
      options: { opensAppToForeground: false },
    },
  ]).catch(() => undefined);
  addNotificationResponseReceivedListener((respuesta) => {
    if (respuesta.actionIdentifier !== ACCION_POSPONER) return;
    const { body, title } = respuesta.notification.request.content;
    scheduleNotificationAsync({
      content: {
        body,
        categoryIdentifier: CATEGORIA_RECORDATORIO,
        title,
      },
      trigger: {
        seconds: MINUTOS_POSPUESTO * 60,
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    }).catch(() => undefined);
  });
}

/** con la app abierta el aviso también se muestra, sin sonido */
export function mostrarAvisosConLaAppAbierta(): void {
  registrarAccionesDeAvisos();
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
      categoryIdentifier: CATEGORIA_RECORDATORIO,
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
