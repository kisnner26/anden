import { expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { RutaFrecuente } from './RutaFrecuente';

it('comunica el trayecto y permite recuperarlo', async () => {
  const alPresionar = jest.fn();
  const pantalla = await renderPantalla(
    <RutaFrecuente
      alPresionar={alPresionar}
      destino="Boaco"
      etiqueta="Usar ruta a Boaco"
      origen="Managua"
      proximaHora="06:30"
    />,
  );

  const ruta = pantalla.getByRole('button', { name: 'Usar ruta a Boaco' });
  expect(ruta.props.accessibilityHint).toBe('Managua, Boaco, 06:30');
  await fireEvent.press(ruta);
  expect(alPresionar).toHaveBeenCalledTimes(1);
});
