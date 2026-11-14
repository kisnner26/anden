import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  SchedulableTriggerInputTypes,
  addNotificationResponseReceivedListener,
  setNotificationCategoryAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
} from 'expo-notifications';

import {
  mostrarAvisosConLaAppAbierta,
  leerPermiso,
  pedirPermiso,
  programarRecordatorio,
} from './notificaciones';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  addNotificationResponseReceivedListener: jest.fn(),
  setNotificationCategoryAsync: jest.fn(async () => null),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

interface Simulado {
  mockResolvedValue: (valor: unknown) => void;
}
const leer = getPermissionsAsync as unknown as Simulado;
const pedir = requestPermissionsAsync as unknown as Simulado;
const programar = scheduleNotificationAsync as unknown as Simulado;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('leerPermiso', () => {
  it('concedido cuando el sistema lo permite', async () => {
    leer.mockResolvedValue({ canAskAgain: true, granted: true });
    expect(await leerPermiso()).toBe('concedido');
  });

  it('sin preguntar cuando todavía se puede pedir', async () => {
    leer.mockResolvedValue({ canAskAgain: true, granted: false });
    expect(await leerPermiso()).toBe('sin-preguntar');
  });

  it('negado cuando ya no se puede pedir', async () => {
    leer.mockResolvedValue({ canAskAgain: false, granted: false });
    expect(await leerPermiso()).toBe('negado');
  });
});

describe('pedirPermiso', () => {
  it('concedido si la persona acepta', async () => {
    pedir.mockResolvedValue({ canAskAgain: true, granted: true });
    expect(await pedirPermiso()).toBe('concedido');
  });

  it('negado si la persona rechaza', async () => {
    pedir.mockResolvedValue({ canAskAgain: false, granted: false });
    expect(await pedirPermiso()).toBe('negado');
  });
});

describe('programarRecordatorio', () => {
  it('programa un aviso local para la fecha indicada', async () => {
    programar.mockResolvedValue('id-1');
    const cuando = new Date('2026-11-03T14:30:00-06:00');
    const id = await programarRecordatorio({
      puntoEncuentro: '764M4PPX+HH',
      cuando,
      destino: 'Boaco',
      texto: { cuerpo: 'Andén 4', titulo: 'Tu bus a Boaco' },
    });
    expect(id).toBe('id-1');
    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        body: 'Andén 4',
        categoryIdentifier: 'recordatorio',
        title: 'Tu bus a Boaco',
      },
      trigger: { date: cuando, type: SchedulableTriggerInputTypes.DATE },
    });
  });
});

describe('acciones del recordatorio', () => {
  it('registra ver boleto y posponer para el reloj', () => {
    mostrarAvisosConLaAppAbierta();
    const llamada = jest.mocked(setNotificationCategoryAsync).mock.calls[0];
    expect(llamada?.[0]).toBe('recordatorio');
    expect(llamada?.[1].map((a) => a.identifier)).toEqual([
      'ver-boleto',
      'posponer',
    ]);
  });

  it('posponer reprograma el mismo aviso en 10 minutos', () => {
    mostrarAvisosConLaAppAbierta();
    const alResponder = jest.mocked(addNotificationResponseReceivedListener)
      .mock.calls[0]?.[0];
    alResponder?.({
      actionIdentifier: 'posponer',
      notification: {
        request: { content: { body: 'Andén 4', title: 'Tu bus' } },
      },
    } as never);
    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        body: 'Andén 4',
        categoryIdentifier: 'recordatorio',
        title: 'Tu bus',
      },
      trigger: {
        seconds: 600,
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  });

  it('ver boleto no reprograma nada', () => {
    mostrarAvisosConLaAppAbierta();
    const alResponder = jest.mocked(addNotificationResponseReceivedListener)
      .mock.calls[0]?.[0];
    alResponder?.({ actionIdentifier: 'ver-boleto' } as never);
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
