import { afterEach, describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { useRecorrido } from '@/datos/useRecorrido';

afterEach(() => reiniciarMuestra());

describe('useRecorrido', () => {
  it('de Managua a Juigalpa trae el trazo de carretera y sus kilómetros', async () => {
    const { result } = await renderHook(() =>
      useRecorrido('Managua', 'Juigalpa'),
    );
    expect(result.current).not.toBeNull();
    expect(result.current!.trazo.length).toBeGreaterThan(2);
    expect(result.current!.distanciaKm).toBeGreaterThan(100);
    expect(result.current!.origen.codigo).toBe('MAY');
    expect(result.current!.destino.codigo).toBe('JUI');
  });

  it('con una ciudad que no existe devuelve null', async () => {
    const { result } = await renderHook(() =>
      useRecorrido('Managua', 'Narnia'),
    );
    expect(result.current).toBeNull();
  });

  it('sin trazo conocido cae a la línea recta entre las dos terminales', async () => {
    const { result } = await renderHook(() =>
      useRecorrido('Boaco', 'Juigalpa'),
    );
    expect(result.current?.trazo).toHaveLength(2);
    expect(result.current?.distanciaKm).toBeNull();
  });
});
