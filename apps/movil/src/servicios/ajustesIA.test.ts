import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { leerIAActivada } from './ajustesIA';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('IA activada', () => {
  it('por defecto está apagada', async () => {
    expect(await leerIAActivada()).toBe(false);
  });
});
