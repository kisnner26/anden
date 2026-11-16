import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { PanelSeguridadViaje } from './PanelSeguridadViaje';

function dibujar(
  propiedades: Partial<React.ComponentProps<typeof PanelSeguridadViaje>> = {},
) {
  return renderPantalla(
    <PanelSeguridadViaje
      alAvisar={jest.fn()}
      alLlamarAlChofer={jest.fn()}
      alLlamarEmergencias={jest.fn()}
      conContacto
      {...propiedades}
    />,
  );
}

describe('PanelSeguridadViaje', () => {
  it('ofrece avisar, llamar al chofer y emergencias', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByText('Avisar a mi contacto de confianza'),
    ).toBeTruthy();
    expect(pantalla.getByText('Llamar al chofer')).toBeTruthy();
    expect(pantalla.getByText('Llamar a emergencias (118)')).toBeTruthy();
  });

  it('cada opción llama a lo suyo', async () => {
    const alAvisar = jest.fn();
    const alLlamarAlChofer = jest.fn();
    const alLlamarEmergencias = jest.fn();
    const pantalla = await dibujar({
      alAvisar,
      alLlamarAlChofer,
      alLlamarEmergencias,
    });
    await fireEvent.press(
      pantalla.getByText('Avisar a mi contacto de confianza'),
    );
    await fireEvent.press(pantalla.getByText('Llamar al chofer'));
    await fireEvent.press(pantalla.getByText('Llamar a emergencias (118)'));
    expect(alAvisar).toHaveBeenCalledTimes(1);
    expect(alLlamarAlChofer).toHaveBeenCalledTimes(1);
    expect(alLlamarEmergencias).toHaveBeenCalledTimes(1);
  });

  it('sin contacto guardado explica cómo dejarlo', async () => {
    const pantalla = await dibujar({ conContacto: false });
    expect(pantalla.getByText(/Guardá un contacto de confianza/)).toBeTruthy();
  });

  it('si la llamada al chofer falló lo dice', async () => {
    const pantalla = await dibujar({ falloLlamada: true });
    expect(
      pantalla.getByText('No se pudo llamar al chofer ahora.'),
    ).toBeTruthy();
  });
});
