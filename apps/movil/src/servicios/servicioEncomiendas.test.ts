import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { type DatosEncomienda } from '@/datos/encomiendas';

import { crearEncomiendasLocal } from './servicioEncomiendas';

const DATOS: DatosEncomienda = {
  descripcion: 'caja con repuestos',
  destinatario: 'Luis Pérez',
  destino: 'Managua',
  origen: 'Boaco',
  remitente: 'Ana Ruiz',
  tamano: 'pequeno',
  telefonoDestinatario: '+505 8888 1234',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('encomiendas locales', () => {
  it('sin encomiendas la lista está vacía', async () => {
    expect(await crearEncomiendasLocal().listar()).toEqual([]);
  });
});
