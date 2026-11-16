import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

import {
  FilaDeViajeChofer,
  type PropiedadesFilaDeViajeChofer,
} from './FilaDeViajeChofer';

const VIAJE: Salida = {
  asientosLibres: 10,
  choferId: 'cho_1',
  codigoDestino: 'BOA',
  destino: 'Boaco',
  estado: 'programado',
  minutosAtraso: 0,
  origen: 'Managua',
  placa: 'M 222-114',
  puntoEncuentro: '764M4PPX+HH',
  rutaId: 'r',
  salida: new Date(2026, 10, 13, 15, 30),
  servicio: 'ordinario',
  tarifa: 70,
  ventaAbierta: true,
  viajeId: 'via_1',
};

function dibujar(extra: Partial<PropiedadesFilaDeViajeChofer> = {}) {
  return render(
    <FilaDeViajeChofer
      alAbrir={jest.fn()}
      alElegirMotivo={jest.fn()}
      alRetirar={jest.fn()}
      cobrado={null}
      confirmando={false}
      motivo={null}
      pideMotivo={false}
      transmitiendo={false}
      viaje={VIAJE}
      {...extra}
    />,
  );
}

describe('FilaDeViajeChofer', () => {
  it('muestra la ruta, el servicio, la placa y la hora', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Managua → Boaco')).toBeTruthy();
    expect(
      pantalla.getByText(`${t('servicios.ordinario')} · M 222-114`),
    ).toBeTruthy();
    expect(pantalla.getByText('3:30')).toBeTruthy();
  });

  it('tocar la tarjeta abre el viaje', async () => {
    const alAbrir = jest.fn();
    const pantalla = await dibujar({ alAbrir });
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: rellenar(t('conductor.abrirViaje'), { destino: 'Boaco' }),
      }),
    );
    expect(alAbrir).toHaveBeenCalledTimes(1);
  });

  it('un viaje sin cerrar ni transmitir ofrece retirarlo', async () => {
    const alRetirar = jest.fn();
    const pantalla = await dibujar({ alRetirar });
    await fireEvent.press(pantalla.getByText(t('nuevoViaje.retirar')));
    expect(alRetirar).toHaveBeenCalledTimes(1);
  });

  it('después de tocar retirar pide confirmar', async () => {
    const pantalla = await dibujar({ confirmando: true });
    expect(pantalla.getByText(t('nuevoViaje.retirarConfirmar'))).toBeTruthy();
    expect(pantalla.queryByText(t('nuevoViaje.retirar'))).toBeNull();
  });
});
