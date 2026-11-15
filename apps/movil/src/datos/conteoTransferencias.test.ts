import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  sumarTransferencia,
  transferenciasDeHoy,
} from './conteoTransferencias';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('conteoTransferencias', () => {
  it('empieza en cero y suma de a una', async () => {
    const hoy = new Date(2026, 10, 14, 9);
    expect(await transferenciasDeHoy(hoy)).toBe(0);
    await sumarTransferencia(hoy);
    await sumarTransferencia(hoy);
    expect(await transferenciasDeHoy(hoy)).toBe(2);
  });

  it('al día siguiente vuelve a cero', async () => {
    await sumarTransferencia(new Date(2026, 10, 14, 9));
    expect(await transferenciasDeHoy(new Date(2026, 10, 15, 9))).toBe(0);
  });
});
