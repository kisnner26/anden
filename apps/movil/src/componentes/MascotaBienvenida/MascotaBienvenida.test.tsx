import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { reproducirSonido } from '@/datos/sonidos';
import { ContextoMascota } from '@/datos/useMascota';
import { renderPantalla } from '@/pruebas/render';

import { MascotaBienvenida } from './MascotaBienvenida';

jest.mock('@/datos/sonidos', () => ({
  reproducirSonido: jest.fn(async () => undefined),
}));

const MANANA = new Date(2026, 10, 12, 8, 0);
const NOCHE = new Date(2026, 10, 12, 21, 0);

beforeEach(() => {
  jest.mocked(reproducirSonido).mockClear();
});

async function dibujar(
  propiedades: Partial<React.ComponentProps<typeof MascotaBienvenida>> = {},
  activa = true,
) {
  return renderPantalla(
    <ContextoMascota.Provider
      value={{ activa, establecerActiva: async () => undefined }}
    >
      <MascotaBienvenida ahora={MANANA} nombre="Ana" {...propiedades} />
    </ContextoMascota.Provider>,
  );
}

describe('MascotaBienvenida', () => {
  it('saluda por la mañana con el nombre', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Buenos días, Ana')).toBeTruthy();
  });

  it('saluda distinto de noche', async () => {
    const pantalla = await dibujar({ ahora: NOCHE });
    expect(pantalla.getByText('Buenas noches, Ana')).toBeTruthy();
  });

  it('saluda sin coma si no hay nombre', async () => {
    const pantalla = await dibujar({ nombre: '' });
    expect(pantalla.getByText('Buenos días')).toBeTruthy();
  });

  it('avisa la próxima salida', async () => {
    const pantalla = await dibujar({
      proximaSalida: { destino: 'Boaco', hora: '9:30 a. m.' },
    });
    expect(
      pantalla.getByText('Tu próximo bus a Boaco sale a las 9:30 a. m.'),
    ).toBeTruthy();
  });

  it('dice que no quedan salidas si no hay próxima', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Hoy ya no quedan salidas.')).toBeTruthy();
  });

  it('toca la bocina al tocarla', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(pantalla.getByTestId('mascota-bienvenida'));
    expect(reproducirSonido).toHaveBeenCalledWith('bocina');
    expect(pantalla.getByText('Piiin, piiin.')).toBeTruthy();
  });

  it('no se dibuja si está apagada', async () => {
    const pantalla = await dibujar({}, false);
    expect(pantalla.queryByTestId('mascota-bienvenida')).toBeNull();
  });
});
