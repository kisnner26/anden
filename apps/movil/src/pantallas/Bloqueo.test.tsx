import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ContextoBloqueo, type ValorBloqueo } from '@/datos/useBloqueo';
import { renderPantalla } from '@/pruebas/render';

import { PuertaBloqueo } from './Bloqueo';

function valor(parcial: Partial<ValorBloqueo>): ValorBloqueo {
  return {
    activar: async () => true,
    activo: true,
    biometria: { disponible: true, tipo: 'rostro' },
    bloqueado: true,
    cargando: false,
    desactivar: async () => true,
    desbloquear: async () => false,
    ...parcial,
  };
}

async function dibujar(parcial: Partial<ValorBloqueo>) {
  return renderPantalla(
    <ContextoBloqueo.Provider value={valor(parcial)}>
      <PuertaBloqueo />
    </ContextoBloqueo.Provider>,
  );
}

describe('PuertaBloqueo', () => {
  it('no dibuja nada si la app no está bloqueada', async () => {
    const pantalla = await dibujar({ bloqueado: false });
    expect(pantalla.queryByText('Andén está bloqueado')).toBeNull();
  });

  it('muestra el bloqueo y pide Face ID al aparecer', async () => {
    const desbloquear = jest.fn(async () => false);
    const pantalla = await dibujar({ desbloquear });
    expect(pantalla.getByText('Andén está bloqueado')).toBeTruthy();
    await waitFor(() => expect(desbloquear).toHaveBeenCalledTimes(1));
  });

  it('avisa si no se pudo confirmar y deja reintentar', async () => {
    const desbloquear = jest.fn(async () => false);
    const pantalla = await dibujar({ desbloquear });
    await waitFor(() =>
      expect(
        pantalla.getByText('No pudimos confirmar que sos vos. Probá de nuevo.'),
      ).toBeTruthy(),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Desbloquear' }),
    );
    await waitFor(() => expect(desbloquear).toHaveBeenCalledTimes(2));
  });

  it('tapa la app mientras lee si el bloqueo está encendido', async () => {
    const pantalla = await dibujar({ bloqueado: false, cargando: true });
    expect(pantalla.queryByText('Andén está bloqueado')).toBeNull();
  });
});
