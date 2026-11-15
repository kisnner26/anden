import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { PortadaPasaporte } from './PortadaPasaporte';

describe('PortadaPasaporte', () => {
  it('es un botón que abre el pasaporte', async () => {
    const alAbrir = jest.fn();
    const p = await renderPantalla(
      <PortadaPasaporte
        abierta={false}
        alAbrir={alAbrir}
        alto={340}
        ancho={340}
      />,
    );
    expect(p.getByText('Pasaporte')).toBeTruthy();
    await fireEvent.press(p.getByRole('button', { name: 'Abrir pasaporte' }));
    expect(alAbrir).toHaveBeenCalledTimes(1);
  });
});
