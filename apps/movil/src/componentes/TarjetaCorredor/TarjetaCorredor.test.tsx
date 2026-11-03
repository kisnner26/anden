import { expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { TarjetaCorredor } from './TarjetaCorredor';

it('explica el corredor y abre su detalle', async () => {
  const alPresionar = jest.fn();
  const pantalla = await renderPantalla(
    <TarjetaCorredor
      alPresionar={alPresionar}
      corredor={{
        destino: 'Managua',
        id: 'cor_wac_man',
        origen: 'Wácwala',
      }}
    />,
  );

  const tarjeta = pantalla.getByRole('button', {
    name: 'Abrir corredor de Wácwala a Managua',
  });
  expect(tarjeta.props.accessibilityHint).toBe(
    'Horarios y ubicación por confirmar',
  );
  expect(pantalla.getByText('Wácwala')).toBeTruthy();
  expect(pantalla.getByText('Managua')).toBeTruthy();
  await fireEvent.press(tarjeta);
  expect(alPresionar).toHaveBeenCalledWith('cor_wac_man');
});
