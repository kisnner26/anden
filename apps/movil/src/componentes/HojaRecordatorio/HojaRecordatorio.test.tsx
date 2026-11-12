import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { RecordatorioSalida } from '@/datos/recordatorios';
import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { HojaRecordatorio } from './HojaRecordatorio';

const AHORA = new Date('2026-11-12T17:00:00Z');
const SALIDA: Salida = {
  anden: 3,
  asientosLibres: 10,
  choferId: 'cho_1',
  codigoDestino: 'BOA',
  destino: 'Boaco',
  estado: 'programado',
  minutosAtraso: 0,
  placa: 'M 000000',
  rutaId: 'rut_1',
  salida: new Date('2026-11-12T17:40:00Z'),
  servicio: 'ordinario',
  tarifa: 100,
  ventaAbierta: true,
  viajeId: 'via_1',
};

function dibujar(
  propiedades: Partial<Parameters<typeof HojaRecordatorio>[0]> = {},
) {
  return renderPantalla(
    <HojaRecordatorio
      ahora={AHORA}
      alCerrar={() => undefined}
      alElegir={() => undefined}
      alQuitar={() => undefined}
      salida={SALIDA}
      {...propiedades}
    />,
  );
}

describe('HojaRecordatorio', () => {
  it('no muestra nada sin una salida elegida', async () => {
    const pantalla = await dibujar({ salida: null });
    expect(pantalla.queryByText('Avisarme antes de la salida')).toBeNull();
  });

  it('ofrece 15, 30 y 60 minutos y deshabilita el que ya no llega', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Avisarme antes de la salida')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: '15 min antes' }).props
        .accessibilityState.disabled,
    ).toBe(false);
    expect(
      pantalla.getByRole('button', { name: '60 min antes' }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it('avisa los minutos elegidos', async () => {
    const alElegir = jest.fn();
    const pantalla = await dibujar({ alElegir });
    await fireEvent.press(
      pantalla.getByRole('button', { name: '30 min antes' }),
    );
    expect(alElegir).toHaveBeenCalledWith(30);
  });

  it('marca el aviso actual y deja quitarlo', async () => {
    const alQuitar = jest.fn();
    const actual = { minutosAntes: 15 } as RecordatorioSalida;
    const pantalla = await dibujar({ actual, alQuitar });
    expect(
      pantalla.getByRole('button', { name: '15 min antes' }).props
        .accessibilityState.selected,
    ).toBe(true);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Quitar recordatorio' }),
    );
    expect(alQuitar).toHaveBeenCalledTimes(1);
  });

  it('explica cuando el permiso está negado', async () => {
    const pantalla = await dibujar({ error: 'permiso-negado' });
    expect(
      pantalla.getByText(/Las notificaciones están desactivadas/),
    ).toBeTruthy();
  });
});
