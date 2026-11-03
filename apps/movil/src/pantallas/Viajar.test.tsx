import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Viajar } from './Viajar';

afterEach(() => reiniciarMuestra());

describe('Viajar', () => {
  it('saluda y pregunta a dónde va la persona', async () => {
    const pantalla = await renderPantalla(
      <Viajar alElegirViaje={() => undefined} />,
    );
    expect(pantalla.getByText('Hola')).toBeTruthy();
    expect(pantalla.getByText('¿A dónde vas hoy?')).toBeTruthy();
  });

  it('muestra el próximo viaje a Granada', async () => {
    const pantalla = await renderPantalla(
      <Viajar alElegirViaje={() => undefined} />,
    );
    expect(pantalla.getByTestId('proximo-viaje')).toBeTruthy();
    expect(pantalla.getAllByText('Granada').length).toBeGreaterThan(0);
  });

  it('avisa que las tarifas son de muestra', async () => {
    const pantalla = await renderPantalla(
      <Viajar alElegirViaje={() => undefined} />,
    );
    expect(pantalla.getByText('Tarifas de muestra')).toBeTruthy();
  });

  it('lista tres salidas pendientes', async () => {
    const pantalla = await renderPantalla(
      <Viajar alElegirViaje={() => undefined} />,
    );
    expect(pantalla.getAllByRole('button', { name: /andén/ })).toHaveLength(3);
  });

  it('abre el viaje al presionar el botón del próximo viaje', async () => {
    const alElegirViaje = jest.fn();
    const pantalla = await renderPantalla(
      <Viajar alElegirViaje={alElegirViaje} />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    );
    expect(alElegirViaje).toHaveBeenCalledWith('via_2');
  });

  it('abre la apariencia desde el avatar', async () => {
    const alAbrirAjustes = jest.fn();
    const pantalla = await renderPantalla(
      <Viajar
        alAbrirAjustes={alAbrirAjustes}
        alElegirViaje={() => undefined}
      />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Apariencia' }));
    expect(alAbrirAjustes).toHaveBeenCalledTimes(1);
  });
});
