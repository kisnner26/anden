import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { HojaContacto } from './HojaContacto';

function dibujar(alGuardar = jest.fn()) {
  return renderPantalla(
    <HojaContacto abierta alCerrar={() => undefined} alGuardar={alGuardar} />,
  );
}

describe('HojaContacto', () => {
  it('guarda un contacto válido con el teléfono en dígitos', async () => {
    const alGuardar = jest.fn();
    const pantalla = await dibujar(alGuardar);
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Mamá');
    await fireEvent.changeText(
      pantalla.getByLabelText('Teléfono'),
      '+505 8888 1234',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Guardar y avisar' }),
    );
    expect(alGuardar).toHaveBeenCalledWith({
      nombre: 'Mamá',
      telefono: '88881234',
    });
  });

  it('no guarda un teléfono inválido y lo explica', async () => {
    const alGuardar = jest.fn();
    const pantalla = await dibujar(alGuardar);
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Mamá');
    await fireEvent.changeText(pantalla.getByLabelText('Teléfono'), '123');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Guardar y avisar' }),
    );
    expect(alGuardar).not.toHaveBeenCalled();
    expect(
      pantalla.getByText(
        'Escribí un nombre y un teléfono de Nicaragua válido.',
      ),
    ).toBeTruthy();
  });
});
