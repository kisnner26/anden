import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ProveedorAjustesConductor } from '@/datos/ProveedorAjustesConductor';
import { ProveedorBloqueo } from '@/datos/ProveedorBloqueo';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { autenticar } from '@/datos/biometria';
import { renderPantalla } from '@/pruebas/render';
import {
  AJUSTES_CONDUCTOR_INICIALES,
  ajustesConductorActuales,
  guardarAjustesConductor,
} from '@/servicios/ajustesConductor';
import { CUENTAS_MUESTRA } from '@/servicios/cuentasMuestra';
import { crearSesionLocal } from '@/servicios/sesion';

import { ConductorAjustes } from './ConductorAjustes';

jest.mock('@/datos/biometria', () => ({
  autenticar: jest.fn(async () => true),
  consultarBiometria: jest.fn(async () => ({
    disponible: true,
    tipo: 'rostro',
  })),
}));

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await guardarAjustesConductor(AJUSTES_CONDUCTOR_INICIALES);
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
    }),
  );
});

function dibujar(alSalir = jest.fn()) {
  return renderPantalla(
    <ProveedorSesion servicio={crearSesionLocal(CUENTAS_MUESTRA)}>
      <ProveedorBloqueo>
        <ProveedorAjustesConductor>
          <ConductorAjustes
            alAbrirAjustesGenerales={() => undefined}
            alSalir={alSalir}
          />
        </ProveedorAjustesConductor>
      </ProveedorBloqueo>
    </ProveedorSesion>,
  );
}

describe('ConductorAjustes', () => {
  it('muestra su nombre y arranca con Face ID apagado', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Marvin Lanzas')).toBeTruthy();
    expect(ajustesConductorActuales().exigirBiometria).toBe(false);
  });

  it('activar Face ID pide confirmar una vez y lo guarda', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Marvin Lanzas');
    await fireEvent.press(
      await pantalla.findByRole('switch', { name: 'Confirmar con Face ID' }),
    );
    await waitFor(() =>
      expect(ajustesConductorActuales().exigirBiometria).toBe(true),
    );
    expect(autenticar).toHaveBeenCalledTimes(1);
  });

  it('si no se confirma, Face ID sigue apagado', async () => {
    jest.mocked(autenticar).mockResolvedValueOnce(false);
    const pantalla = await dibujar();
    await pantalla.findByText('Marvin Lanzas');
    await fireEvent.press(
      await pantalla.findByRole('switch', { name: 'Confirmar con Face ID' }),
    );
    await waitFor(() => expect(autenticar).toHaveBeenCalled());
    expect(ajustesConductorActuales().exigirBiometria).toBe(false);
  });

  it('apaga la pantalla encendida y cierra la sesión', async () => {
    const alSalir = jest.fn();
    const pantalla = await dibujar(alSalir);
    await pantalla.findByText('Marvin Lanzas');
    await fireEvent.press(
      pantalla.getByRole('switch', { name: 'Mantener la pantalla encendida' }),
    );
    await waitFor(() =>
      expect(ajustesConductorActuales().pantallaEncendida).toBe(false),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cerrar sesión' }),
    );
    await waitFor(() => expect(alSalir).toHaveBeenCalledTimes(1));
    expect(await AsyncStorage.getItem('anden.sesion')).toBeNull();
  });
});
