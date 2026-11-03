import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  SchedulableTriggerInputTypes,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
} from 'expo-notifications';

import {
  leerPermiso,
  pedirPermiso,
  programarRecordatorio,
} from './notificaciones';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
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
      anden: 4,
      cuando,
      destino: 'Granada',
      texto: { cuerpo: 'Andén 4', titulo: 'Tu bus a Granada' },
    });
    expect(id).toBe('id-1');
    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { body: 'Andén 4', title: 'Tu bus a Granada' },
      trigger: { date: cuando, type: SchedulableTriggerInputTypes.DATE },
    });
  });
});
