import * as Haptics from 'expo-haptics';

import { reproducirSonido } from './sonidos';

/** lo que la persona siente al tocar: una sola tabla para vibración y sonido en toda la app */
export type Sensacion =
  'aviso' | 'empuje' | 'error' | 'exito' | 'seleccion' | 'toque';

/** cada sensación con su vibración y, si corresponde, su sonido suave */
export function ejecutarSensacion(
  sensacion: Sensacion,
  conSonido: boolean,
): void {
  const ignorar = () => undefined;
  switch (sensacion) {
    case 'toque':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        ignorar,
      );
      return;
    case 'empuje':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        ignorar,
      );
      return;
    case 'seleccion':
      void Haptics.selectionAsync().catch(ignorar);
      return;
    case 'exito':
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(ignorar);
      if (conSonido) void reproducirSonido('confirmacion');
      return;
    case 'error':
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      ).catch(ignorar);
      return;
    case 'aviso':
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      ).catch(ignorar);
      return;
  }
}
