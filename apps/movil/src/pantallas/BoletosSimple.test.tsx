import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';
import { ContextoBoletos, type ValorBoletos } from '@/datos/useBoletos';
import { t } from '@/textos/t';

import { BoletosSimple } from './BoletosSimple';

function valor(boletos: ValorBoletos['boletos'] = []): ValorBoletos {
  return {
    agregar: async () => undefined,
    boletos,
    cancelar: async () => undefined,
    cargando: false,
    quitar: async () => undefined,
    reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
    validar: async () => undefined,
  };
}

function dibujar(
  boletos: ValorBoletos['boletos'],
  extra: { alAbrirBoleto?: () => void; alBuscar?: () => void } = {},
) {
  return renderPantalla(
    <ContextoBoletos.Provider value={valor(boletos)}>
      <BoletosSimple
        alAbrirBoleto={extra.alAbrirBoleto ?? jest.fn()}
        alBuscar={extra.alBuscar ?? jest.fn()}
        alSalir={jest.fn()}
      />
    </ContextoBoletos.Provider>,
  );
}

describe('BoletosSimple', () => {
  it('sin boletos ofrece un solo botón para buscar un viaje', async () => {
    const alBuscar = jest.fn();
    const pantalla = await dibujar([], { alBuscar });
    expect(pantalla.getByText(t('pantallasSimples.boletosSin'))).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: t('pantallasSimples.boletosBuscar'),
      }),
    );
    expect(alBuscar).toHaveBeenCalledTimes(1);
  });

  it('muestra un botón gigante por cada boleto vigente', async () => {
    const a = boletoDePrueba(new Date(2099, 0, 5, 9, 0), 3, 'AAAA1111');
    const pantalla = await dibujar([a]);
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText(/Asiento 3/)).toBeTruthy();
  });
});
