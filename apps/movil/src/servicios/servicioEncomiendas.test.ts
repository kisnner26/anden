import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { nuevaEncomienda, type DatosEncomienda } from '@/datos/encomiendas';

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

  it('guarda una encomienda y la lista', async () => {
    const servicio = crearEncomiendasLocal();
    const encomienda = nuevaEncomienda(DATOS, new Date(2026, 10, 13, 9, 0));
    expect(await servicio.guardar(encomienda)).toBe(true);
    expect(await servicio.listar()).toEqual([encomienda]);
  });

  it('actualizar cambia solo la encomienda indicada', async () => {
    const servicio = crearEncomiendasLocal();
    const a = nuevaEncomienda(DATOS, new Date(2026, 10, 13, 9, 0));
    const b = nuevaEncomienda(
      { ...DATOS, descripcion: 'sobre' },
      new Date(2026, 10, 13, 9, 5),
    );
    await servicio.guardar(a);
    await servicio.guardar(b);
    await servicio.actualizar({ ...a, estado: 'aceptada' });
    const lista = (await servicio.listar()) ?? [];
    expect(lista.find((e) => e.id === a.id)?.estado).toBe('aceptada');
    expect(lista.find((e) => e.id === b.id)?.estado).toBe(b.estado);
  });
});
