import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Viajar } from './Viajar';

afterEach(() => reiniciarMuestra());

function dibujar(propiedades: Partial<Parameters<typeof Viajar>[0]> = {}) {
  return renderPantalla(
    <Viajar
      alAbrirViaje={() => undefined}
      alElegirAsiento={() => undefined}
      {...propiedades}
    />,
  );
}

describe('Viajar', () => {
  it('saluda y pregunta a dónde va la persona', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Hola')).toBeTruthy();
    expect(pantalla.getByText('¿A dónde vas hoy?')).toBeTruthy();
  });

  it('muestra el próximo viaje a Granada', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByTestId('proximo-viaje')).toBeTruthy();
    expect(pantalla.getAllByText('Granada').length).toBeGreaterThan(0);
  });

  it('avisa que las tarifas son de muestra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Tarifas de muestra')).toBeTruthy();
  });

  it('lista tres salidas pendientes', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getAllByRole('button', { name: /andén/ })).toHaveLength(3);
  });

  it('va directo a los asientos desde el botón del próximo viaje', async () => {
    const alElegirAsiento = jest.fn();
    const pantalla = await dibujar({ alElegirAsiento });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    );
    expect(alElegirAsiento).toHaveBeenCalledWith('via_2');
  });

  it('abre el detalle del viaje desde una fila de salida', async () => {
    const alAbrirViaje = jest.fn();
    const pantalla = await dibujar({ alAbrirViaje });
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: /andén/ })[0] as never,
    );
    expect(alAbrirViaje).toHaveBeenCalledWith('via_2');
  });

  it('abre la apariencia desde el avatar', async () => {
    const alAbrirAjustes = jest.fn();
    const pantalla = await dibujar({ alAbrirAjustes });
    await fireEvent.press(pantalla.getByRole('button', { name: 'Apariencia' }));
    expect(alAbrirAjustes).toHaveBeenCalledTimes(1);
  });
});
