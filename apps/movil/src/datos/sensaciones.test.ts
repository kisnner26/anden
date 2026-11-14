import { afterEach, describe, expect, it, jest } from '@jest/globals';
import * as Haptics from 'expo-haptics';

import { ejecutarSensacion } from './sensaciones';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ejecutarSensacion', () => {
  it('un toque vibra ligero y la selección da el tic de selección', () => {
    const impacto = jest.spyOn(Haptics, 'impactAsync');
    const seleccion = jest.spyOn(Haptics, 'selectionAsync');
    ejecutarSensacion('toque', true);
    ejecutarSensacion('seleccion', true);
    expect(impacto).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(seleccion).toHaveBeenCalledTimes(1);
  });

  it('el empuje vibra más fuerte que un toque', () => {
    const impacto = jest.spyOn(Haptics, 'impactAsync');
    ejecutarSensacion('empuje', true);
    expect(impacto).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('éxito, error y aviso usan las notificaciones de cada tipo', () => {
    const notificacion = jest.spyOn(Haptics, 'notificationAsync');
    ejecutarSensacion('exito', false);
    ejecutarSensacion('error', false);
    ejecutarSensacion('aviso', false);
    expect(notificacion.mock.calls.map((llamada) => llamada[0])).toEqual([
      Haptics.NotificationFeedbackType.Success,
      Haptics.NotificationFeedbackType.Error,
      Haptics.NotificationFeedbackType.Warning,
    ]);
  });
});
