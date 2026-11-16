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
      alCancelarRetiro={jest.fn()}
      alConfirmarRetiro={jest.fn()}
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

  it('después de tocar retirar pregunta y deja confirmar o volver', async () => {
    const pantalla = await dibujar({ confirmando: true });
    expect(pantalla.getByText(t('nuevoViaje.retirarPregunta'))).toBeTruthy();
    expect(pantalla.getByText(t('nuevoViaje.retirarVolver'))).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: t('nuevoViaje.retirar') }),
    ).toBeTruthy();
  });

  it('sin pasajeros explica que el viaje se quita de la lista', async () => {
    const pantalla = await dibujar({ confirmando: true });
    expect(
      pantalla.getByText(t('nuevoViaje.retirarSinPasajeros')),
    ).toBeTruthy();
  });

  it('con pasajeros explica que lo verán cancelado', async () => {
    const pantalla = await dibujar({ confirmando: true, pideMotivo: true });
    expect(
      pantalla.getByText(t('nuevoViaje.retirarConPasajeros')),
    ).toBeTruthy();
  });

  it('confirmar avisa que se retire', async () => {
    const alConfirmarRetiro = jest.fn();
    const pantalla = await dibujar({ alConfirmarRetiro, confirmando: true });
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('nuevoViaje.retirar') }),
    );
    expect(alConfirmarRetiro).toHaveBeenCalledTimes(1);
  });

  it('volver cierra la confirmación sin retirar', async () => {
    const alCancelarRetiro = jest.fn();
    const alConfirmarRetiro = jest.fn();
    const pantalla = await dibujar({
      alCancelarRetiro,
      alConfirmarRetiro,
      confirmando: true,
    });
    await fireEvent.press(pantalla.getByText(t('nuevoViaje.retirarVolver')));
    expect(alCancelarRetiro).toHaveBeenCalledTimes(1);
    expect(alConfirmarRetiro).not.toHaveBeenCalled();
  });

  it('con pasajeros no deja retirar hasta elegir el motivo', async () => {
    const alConfirmarRetiro = jest.fn();
    const pantalla = await dibujar({
      alConfirmarRetiro,
      confirmando: true,
      pideMotivo: true,
    });
    const boton = pantalla.getByRole('button', {
      name: t('nuevoViaje.retirar'),
    });
    expect(boton.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(boton);
    expect(alConfirmarRetiro).not.toHaveBeenCalled();
  });

  it('con el motivo elegido ya deja retirar', async () => {
    const pantalla = await dibujar({
      confirmando: true,
      motivo: 'clima',
      pideMotivo: true,
    });
    expect(
      pantalla.getByRole('button', { name: t('nuevoViaje.retirar') }).props
        .accessibilityState,
    ).toMatchObject({ disabled: false });
  });

  it('mientras se retira muestra el avance y no deja tocar otra vez', async () => {
    const pantalla = await dibujar({ confirmando: true, enviandoRetiro: true });
    expect(pantalla.getByText(t('nuevoViaje.retirando'))).toBeTruthy();
  });

  it('si no se pudo retirar lo dice dentro de la tarjeta', async () => {
    const pantalla = await dibujar({ confirmando: true, falloRetiro: true });
    expect(pantalla.getByText(t('nuevoViaje.retirarFallo'))).toBeTruthy();
  });

  it('un viaje cerrado muestra lo cobrado y no se puede retirar', async () => {
    const pantalla = await dibujar({ cobrado: 240 });
    expect(
      pantalla.getByText(
        rellenar(t('conductor.cerradoCorto'), { cobrado: 240 }),
      ),
    ).toBeTruthy();
    expect(pantalla.queryByText(t('nuevoViaje.retirar'))).toBeNull();
  });

  it('un viaje en vivo lo indica y no se puede retirar', async () => {
    const pantalla = await dibujar({ transmitiendo: true });
    expect(pantalla.getByText(t('conductor.enVivo'))).toBeTruthy();
    expect(pantalla.queryByText(t('nuevoViaje.retirar'))).toBeNull();
  });

  it('sin pasajeros no pide el motivo', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryByText(t('nuevoViaje.motivoTitulo'))).toBeNull();
  });

  it('con pasajeros pide elegir el motivo entre cuatro', async () => {
    const pantalla = await dibujar({ confirmando: true, pideMotivo: true });
    expect(pantalla.getByText(t('nuevoViaje.motivoTitulo'))).toBeTruthy();
    expect(pantalla.getByText(t('motivoCancelacion.averia'))).toBeTruthy();
    expect(pantalla.getByText(t('motivoCancelacion.clima'))).toBeTruthy();
    expect(pantalla.getByText(t('motivoCancelacion.pocos'))).toBeTruthy();
    expect(pantalla.getByText(t('motivoCancelacion.otro'))).toBeTruthy();
  });

  it('elegir un motivo avisa cuál', async () => {
    const alElegirMotivo = jest.fn();
    const pantalla = await dibujar({
      alElegirMotivo,
      confirmando: true,
      pideMotivo: true,
    });
    await fireEvent.press(pantalla.getByText(t('motivoCancelacion.clima')));
    expect(alElegirMotivo).toHaveBeenCalledWith('clima');
  });

  it('el motivo elegido queda marcado', async () => {
    const pantalla = await dibujar({
      confirmando: true,
      motivo: 'pocos',
      pideMotivo: true,
    });
    const fichas = pantalla
      .getAllByRole('button')
      .filter((b) => b.props.accessibilityState?.selected === true);
    expect(fichas).toHaveLength(1);
  });
});
