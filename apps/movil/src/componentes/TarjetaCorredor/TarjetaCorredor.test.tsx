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
        id: 'cor_boa_man',
        origen: 'Boaco',
      }}
    />,
  );

  const tarjeta = pantalla.getByRole('button', {
    name: 'Abrir Boaco a Managua',
  });
  expect(tarjeta.props.accessibilityHint).toBe(
    'Horarios y ubicación por confirmar',
  );
  expect(pantalla.getByText('Boaco')).toBeTruthy();
  expect(pantalla.getByText('Managua')).toBeTruthy();
  expect(pantalla.getByText('6:30 a. m.')).toBeTruthy();
  expect(pantalla.getByText('18 min')).toBeTruthy();
  expect(pantalla.getByText('Operación de muestra')).toBeTruthy();
  await fireEvent.press(tarjeta);
  expect(alPresionar).toHaveBeenCalledWith('cor_boa_man');
});

it('explica cuando un corredor no tiene servicio anunciado', async () => {
  const pantalla = await renderPantalla(
    <TarjetaCorredor
      alPresionar={() => undefined}
      corredor={{
        destino: 'Managua',
        id: 'cor_jui_man',
        origen: 'Juigalpa',
      }}
    />,
  );

  expect(pantalla.getByText('Sin servicio anunciado')).toBeTruthy();
  expect(
    pantalla.getByText('Revisá más tarde para ver la próxima unidad.'),
  ).toBeTruthy();
});
