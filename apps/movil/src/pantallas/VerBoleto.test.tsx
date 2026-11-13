import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Share } from 'react-native';

jest.mock('@/datos/notificaciones', () => ({
  abrirAjustesDelSistema: jest.fn(async () => undefined),
  cancelarRecordatorio: jest.fn(async () => undefined),
  leerPermiso: jest.fn(async () => 'concedido'),
  pedirPermiso: jest.fn(async () => 'concedido'),
  programarRecordatorio: jest.fn(async () => 'notif_1'),
}));

jest.mock('../../modules/anden-actividad', () => ({
  actividadesDisponibles: jest.fn(async () => true),
  iniciarActividad: jest.fn(async () => 'act_1'),
  terminarActividad: jest.fn(async () => undefined),
}));

import {
  iniciarActividad,
  terminarActividad,
} from '../../modules/anden-actividad';
import { programarRecordatorio } from '@/datos/notificaciones';
import { ProveedorRecordatorios } from '@/datos/ProveedorRecordatorios';
import { CLAVE_BOLETOS, ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { ProveedorHabituales } from '@/datos/ProveedorHabituales';
import { ProveedorPagos } from '@/datos/ProveedorPagos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { VerBoleto } from './VerBoleto';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
  await AsyncStorage.setItem(
    CLAVE_BOLETOS,
    JSON.stringify([boletoDePrueba(new Date(Date.now() + 60 * 60_000))]),
  );
});

function dibujar(propiedades: Partial<Parameters<typeof VerBoleto>[0]> = {}) {
  return renderPantalla(
    <ProveedorBoletos>
      <VerBoleto
        alCancelado={() => undefined}
        alVerChofer={() => undefined}
        alVolver={() => undefined}
        boletoId="bol_K7RM4QX9"
        {...propiedades}
      />
    </ProveedorBoletos>,
  );
}

describe('VerBoleto', () => {
  it('muestra el talón con el código, el QR y el destino', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByTestId('talon-boleto')).toBeTruthy();
    expect(pantalla.getByText('K7RM 4QX9')).toBeTruthy();
    expect(pantalla.getByLabelText('QR K7RM4QX9')).toBeTruthy();
  });

  it('recuerda cuánto pagar al abordar y llevar el monto exacto', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Pagás al abordar')).toBeTruthy();
    expect(pantalla.getAllByText('C$ 46')).toHaveLength(2);
    expect(pantalla.getByText('Llevá el monto exacto.')).toBeTruthy();
  });

  it('abre el perfil del chofer', async () => {
    const alVerChofer = jest.fn();
    const pantalla = await dibujar({ alVerChofer });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: /Ver chofer/ }),
    );
    expect(alVerChofer).toHaveBeenCalledWith('cho_2');
  });

  it('mantiene las acciones secundarias del boleto disponibles', async () => {
    const pantalla = await dibujar();
    expect(
      await pantalla.findByRole('button', {
        name: 'Compartir datos del viaje',
      }),
    ).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Agregar recordatorio' }),
    ).toBeTruthy();
    expect(
      pantalla.queryByRole('button', { name: 'Cambiar salida' }),
    ).toBeNull();
    expect(
      pantalla.queryByRole('button', { name: 'Validar abordaje' }),
    ).toBeNull();
  });

  it('comparte datos del viaje sin exponer el código de abordaje', async () => {
    const compartir = jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'dismissedAction',
      activityType: undefined,
    });
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Compartir datos del viaje',
      }),
    );
    expect(compartir).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.not.stringContaining('K7RM4QX9'),
      }),
    );
    compartir.mockRestore();
  });

  it('pide confirmación antes de cancelar y permite mantener la reserva', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Cancelar reserva' }),
    );
    expect(pantalla.getByText('¿Cancelar esta reserva?')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'No, mantener' }),
    );
    expect(
      pantalla.getByRole('button', { name: 'Cancelar reserva' }),
    ).toBeTruthy();
  });

  it('cancela la reserva y conserva el boleto con su estado', async () => {
    const alCancelado = jest.fn();
    const pantalla = await dibujar({ alCancelado });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Cancelar reserva' }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Sí, cancelar' }),
    );
    await waitFor(() => expect(alCancelado).toHaveBeenCalledTimes(1));
    expect(await AsyncStorage.getItem(CLAVE_BOLETOS)).toContain(
      '"estado":"cancelado"',
    );
  });

  it('en un boleto inexistente hay una flecha para volver', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar({ alVolver, boletoId: 'bol_x' });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Volver' }),
    );
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('dice que no encontró un boleto inexistente', async () => {
    const pantalla = await dibujar({ boletoId: 'bol_x' });
    expect(
      await pantalla.findByText('No encontramos este boleto.'),
    ).toBeTruthy();
  });

  it('muestra el estado cancelado sin acciones operables', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        {
          ...boletoDePrueba(new Date(Date.now() + 60 * 60_000)),
          boleto: {
            ...boletoDePrueba(new Date(Date.now() + 60 * 60_000)).boleto,
            estado: 'cancelado',
          },
        },
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Estado: Boleto cancelado')).toBeTruthy();
    expect(
      pantalla.queryByRole('button', { name: 'Cancelar reserva' }),
    ).toBeNull();
  });

  it('recuerda verificar placa, chofer y andén antes de subir', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Verificá antes de subir')).toBeTruthy();
    expect(pantalla.getByText('La placa es M 222-114.')).toBeTruthy();
    expect(pantalla.getByText('El chofer es Marvin Lanzas.')).toBeTruthy();
    expect(pantalla.getByText(/^Sale del andén \d+\.$/)).toBeTruthy();
  });

  it('en un boleto cancelado ofrece reservar otra salida al mismo destino', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        {
          ...boletoDePrueba(new Date(Date.now() + 60 * 60_000)),
          boleto: {
            ...boletoDePrueba(new Date(Date.now() + 60 * 60_000)).boleto,
            estado: 'cancelado',
          },
        },
      ]),
    );
    const alReservarOtra = jest.fn();
    const pantalla = await dibujar({ alReservarOtra });
    expect(pantalla.queryByText('Verificá antes de subir')).toBeNull();
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Reservar otra salida a Boaco',
      }),
    );
    expect(alReservarOtra).toHaveBeenCalledWith('Boaco');
  });

  it('muestra que el conductor ya marcó el pago en efectivo', async () => {
    await AsyncStorage.setItem(
      'anden.pagos',
      JSON.stringify({ bol_K7RM4QX9: { estado: 'pagado_efectivo' } }),
    );
    const pantalla = await renderPantalla(
      <ProveedorBoletos>
        <ProveedorPagos>
          <VerBoleto
            alCancelado={() => undefined}
            alVerChofer={() => undefined}
            alVolver={() => undefined}
            boletoId="bol_K7RM4QX9"
          />
        </ProveedorPagos>
      </ProveedorBoletos>,
    );
    expect(
      await pantalla.findByText('Pagado en efectivo al conductor'),
    ).toBeTruthy();
  });

  it('sin pago marcado no dice que está pagado', async () => {
    const pantalla = await dibujar();
    await pantalla.findByTestId('talon-boleto');
    expect(pantalla.queryByText('Pagado en efectivo al conductor')).toBeNull();
  });

  it('un boleto cancelado no pide pagar al abordar ni muestra reglas', async () => {
    const base = boletoDePrueba(new Date(Date.now() + 60 * 60_000));
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        { ...base, boleto: { ...base.boleto, estado: 'cancelado' } },
      ]),
    );
    const pantalla = await dibujar();
    await pantalla.findByTestId('talon-boleto');
    expect(pantalla.queryByText('Pagás al abordar')).toBeNull();
    expect(pantalla.queryByText('Llevá el monto exacto.')).toBeNull();
    expect(pantalla.queryByText('Reglas de muestra')).toBeNull();
  });

  it('un boleto con la salida vencida tampoco pide pagar', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(new Date(Date.now() - 3 * 3_600_000))]),
    );
    const pantalla = await dibujar();
    await pantalla.findByTestId('talon-boleto');
    expect(pantalla.getByText('Estado: Salida vencida')).toBeTruthy();
    expect(pantalla.queryByText('Pagás al abordar')).toBeNull();
  });

  it('guarda el viaje del boleto como viaje habitual y lo dice', async () => {
    const base = boletoDePrueba(new Date(Date.now() + 60 * 60_000));
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        { ...base, resumen: { ...base.resumen, origen: 'Mercado Mayoreo' } },
      ]),
    );
    const pantalla = await renderPantalla(
      <ProveedorBoletos>
        <ProveedorHabituales>
          <VerBoleto
            alCancelado={() => undefined}
            alVerChofer={() => undefined}
            alVolver={() => undefined}
            boletoId="bol_K7RM4QX9"
          />
        </ProveedorHabituales>
      </ProveedorBoletos>,
    );
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Guardar como mi viaje habitual',
      }),
    );
    expect(
      await pantalla.findByText('Guardado como tu viaje habitual'),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.habituales')).toContain(
      '"origen":"Managua"',
    );
    expect(await AsyncStorage.getItem('anden.habituales')).toContain(
      '"destino":"Boaco"',
    );
  });

  it('sin saber de qué terminal sale no ofrece guardarlo como habitual', async () => {
    const pantalla = await dibujar();
    await pantalla.findByTestId('talon-boleto');
    expect(
      pantalla.queryByRole('button', {
        name: 'Guardar como mi viaje habitual',
      }),
    ).toBeNull();
  });

  it('en un boleto cuya salida ya pasó deja reportar un objeto olvidado y lo muestra', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(new Date(Date.now() - 3 * 3_600_000))]),
    );
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Reportar un objeto olvidado',
      }),
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Qué dejaste'),
      'mochila azul',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Guardar reporte' }),
    );
    expect(
      await pantalla.findByText('Tus reportes de este viaje'),
    ).toBeTruthy();
    expect(await pantalla.findByText('mochila azul')).toBeTruthy();
    expect(await AsyncStorage.getItem('anden.objetosOlvidados')).toContain(
      'mochila azul',
    );
  });

  it('en un boleto vigente no ofrece reportar un objeto olvidado', async () => {
    const pantalla = await dibujar();
    await pantalla.findByTestId('talon-boleto');
    expect(
      pantalla.queryByRole('button', { name: 'Reportar un objeto olvidado' }),
    ).toBeNull();
  });

  it('con una persona de confianza guardada abre Mensajes con el viaje ya escrito', async () => {
    await AsyncStorage.setItem(
      'anden.contactoConfianza',
      JSON.stringify({ nombre: 'Mamá', telefono: '88881234' }),
    );
    const abrir = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Avisar a Mamá' }),
    );
    expect(abrir).toHaveBeenCalledTimes(1);
    const url = String(abrir.mock.calls[0]?.[0]);
    expect(url.startsWith('sms:+50588881234&body=')).toBe(true);
    expect(decodeURIComponent(url)).toContain('Voy en el bus a Boaco');
    expect(decodeURIComponent(url)).toContain('Placa M 222-114');
    expect(decodeURIComponent(url)).toContain('anden://viaje/via_2');
    expect(decodeURIComponent(url)).not.toContain('K7RM');
    abrir.mockRestore();
  });

  it('sin contacto pide uno, lo guarda y avisa', async () => {
    const abrir = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Avisar a mi persona de confianza',
      }),
    );
    await fireEvent.changeText(pantalla.getByLabelText('Nombre'), 'Mamá');
    await fireEvent.changeText(
      pantalla.getByLabelText('Teléfono'),
      '8888 1234',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Guardar y avisar' }),
    );
    await waitFor(() => expect(abrir).toHaveBeenCalledTimes(1));
    expect(await AsyncStorage.getItem('anden.contactoConfianza')).toContain(
      '88881234',
    );
    abrir.mockRestore();
  });

  it('un boleto que ya no está vigente no ofrece avisar a nadie', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(new Date(Date.now() - 3 * 3_600_000))]),
    );
    const pantalla = await dibujar();
    await pantalla.findByTestId('talon-boleto');
    expect(
      pantalla.queryByRole('button', {
        name: 'Avisar a mi persona de confianza',
      }),
    ).toBeNull();
  });

  it('el recordatorio del boleto abre la hoja, programa el aviso y lo muestra puesto', async () => {
    const pantalla = await renderPantalla(
      <ProveedorBoletos>
        <ProveedorRecordatorios>
          <VerBoleto
            alCancelado={() => undefined}
            alVerChofer={() => undefined}
            alVolver={() => undefined}
            boletoId="bol_K7RM4QX9"
          />
        </ProveedorRecordatorios>
      </ProveedorBoletos>,
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Agregar recordatorio' }),
    );
    expect(
      await pantalla.findByText('Avisarme antes de la salida'),
    ).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: '30 min antes' }),
    );
    await waitFor(() => expect(programarRecordatorio).toHaveBeenCalledTimes(1));
    expect(await pantalla.findByText('Aviso 30 min antes')).toBeTruthy();
  });

  it('sigue el viaje en la pantalla de bloqueo y lo quita al volver a tocar', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Seguir en la pantalla de bloqueo',
      }),
    );
    await waitFor(() => expect(iniciarActividad).toHaveBeenCalledTimes(1));
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: 'Siguiendo en la pantalla de bloqueo, tocá para quitar',
      }),
    );
    await waitFor(() =>
      expect(terminarActividad).toHaveBeenCalledWith('act_1'),
    );
  });
});
