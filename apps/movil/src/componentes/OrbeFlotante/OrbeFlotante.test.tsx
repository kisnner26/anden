import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

const mockEmpujar = jest.fn();
let mockRuta = '/viajar';
jest.mock('expo-router', () => ({
  usePathname: () => mockRuta,
  useRouter: () => ({ push: mockEmpujar }),
}));

import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { ContextoSesion, type ValorSesion } from '@/datos/useSesion';
import { renderPantalla } from '@/pruebas/render';

import { OrbeFlotante } from './OrbeFlotante';

function ia(usable: boolean): ValorIA {
  return {
    activada: usable,
    cambiar: async () => undefined,
    cargando: false,
    disponibilidad: 'disponible',
    nombre: 'Apple Intelligence',
    preguntar: async () => '',
    usable,
  };
}

function sesion(rol: 'conductor' | 'pasajero' | null): ValorSesion {
  return {
    cargando: false,
    cerrar: async () => undefined,
    iniciar: async () => ({ error: 'credenciales', ok: false }),
    registrar: async () => ({ error: 'conexion', ok: false }),
    rol: rol ?? 'pasajero',
    sesion: rol ? { nombre: 'Ana', rol } : null,
  };
}

function dibujar(usable: boolean, rol: 'conductor' | 'pasajero' | null) {
  return renderPantalla(
    <ContextoIA.Provider value={ia(usable)}>
      <ContextoSesion.Provider value={sesion(rol)}>
        <OrbeFlotante />
      </ContextoSesion.Provider>
    </ContextoIA.Provider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRuta = '/viajar';
});

describe('OrbeFlotante', () => {
  it('abre el asistente desde cualquier pantalla', async () => {
    const pantalla = await dibujar(true, 'pasajero');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Preguntale a Andén' }),
    );
    expect(mockEmpujar).toHaveBeenCalledWith('/asistente');
  });

  it('no aparece sin IA activada, sin cuenta ni para el conductor', async () => {
    for (const [usable, rol] of [
      [false, 'pasajero'],
      [true, null],
      [true, 'conductor'],
    ] as const) {
      const pantalla = await dibujar(usable, rol);
      expect(pantalla.queryByRole('button')).toBeNull();
    }
  });

  it('se esconde dentro del propio asistente', async () => {
    mockRuta = '/asistente';
    const pantalla = await dibujar(true, 'pasajero');
    expect(pantalla.queryByRole('button')).toBeNull();
  });
});
