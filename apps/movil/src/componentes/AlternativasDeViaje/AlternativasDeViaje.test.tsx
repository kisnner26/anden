import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

import { AlternativasDeViaje } from './AlternativasDeViaje';

function salida(id: string, hora: number, libres = 8): Salida {
  return {
    asientosLibres: libres,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    puntoEncuentro: 'x',
    rutaId: 'r',
    salida: new Date(2026, 10, 13, hora, 0),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: id,
  };
}

describe('AlternativasDeViaje', () => {
  it('con salidas explica que el cambio no cuesta más', async () => {
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={jest.fn()}
        eligiendo={null}
        salidas={[salida('a', 15)]}
      />,
    );
    expect(pantalla.getByText(t('alternativas.detalle'))).toBeTruthy();
  });

  it('sin salidas lo dice', async () => {
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={jest.fn()}
        eligiendo={null}
        salidas={[]}
      />,
    );
    expect(pantalla.getByText(t('alternativas.ninguna'))).toBeTruthy();
  });

  it('muestra cuántos asientos quedan en cada salida', async () => {
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={jest.fn()}
        eligiendo={null}
        salidas={[salida('a', 15, 4)]}
      />,
    );
    expect(
      pantalla.getByText(rellenar(t('alternativas.libres'), { cantidad: 4 })),
    ).toBeTruthy();
  });

  it('tocar una salida avisa cuál se eligió', async () => {
    const alElegir = jest.fn();
    const elegida = salida('a', 15);
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={alElegir}
        eligiendo={null}
        salidas={[elegida]}
      />,
    );
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alElegir).toHaveBeenCalledWith(elegida);
  });

  it('mientras se pasa a una salida no se puede tocar otra', async () => {
    const alElegir = jest.fn();
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={alElegir}
        eligiendo="a"
        salidas={[salida('a', 15), salida('b', 17)]}
      />,
    );
    for (const boton of pantalla.getAllByRole('button'))
      await fireEvent.press(boton);
    expect(alElegir).not.toHaveBeenCalled();
  });

  it('la salida a la que se está pasando muestra que está pasando', async () => {
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={jest.fn()}
        eligiendo="a"
        salidas={[salida('a', 15), salida('b', 17)]}
      />,
    );
    expect(pantalla.getAllByText(t('alternativas.pasando'))).toHaveLength(1);
    expect(pantalla.getAllByText(t('alternativas.elegir'))).toHaveLength(1);
  });

  it('muestra el error cuando lo hay', async () => {
    const pantalla = await render(
      <AlternativasDeViaje
        alElegir={jest.fn()}
        error="No se pudo cambiar"
        eligiendo={null}
        salidas={[salida('a', 15)]}
      />,
    );
    expect(pantalla.getByText('No se pudo cambiar')).toBeTruthy();
  });
});
