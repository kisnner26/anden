import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { nuevaEncomienda } from '@/datos/encomiendas';
import { ProveedorEncomiendas } from '@/datos/ProveedorEncomiendas';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';
import { reiniciarServicioEncomiendas } from '@/servicios/servicioEncomiendas';

import { ConductorEncomiendas } from './ConductorEncomiendas';

function solicitud(choferId: string) {
  return nuevaEncomienda({
    choferId,
    descripcion: 'caja con repuestos',
    destinatario: 'Luis Pérez',
    destino: 'Boaco',
    origen: 'Managua',
    remitente: 'Ana Ruiz',
    tamano: 'pequeno',
    telefonoDestinatario: '88881234',
    viajeId: 'via_x',
  });
}

beforeEach(async () => {
  reiniciarServicioEncomiendas();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({ choferId: 'cho_1', nombre: 'Ernesto', rol: 'conductor' }),
  );
  await AsyncStorage.setItem(
    'anden.encomiendas',
    JSON.stringify([
      solicitud('cho_1'),
      { ...solicitud('cho_9'), id: 'otra', codigo: 'ENC-OTRA' },
    ]),
  );
});

function dibujar() {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorEncomiendas>
        <ConductorEncomiendas />
      </ProveedorEncomiendas>
    </ProveedorSesion>,
  );
}

describe('ConductorEncomiendas', () => {
  it('solo muestra las de sus propios viajes', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('caja con repuestos')).toBeTruthy();
    expect(pantalla.queryByText('ENC-OTRA')).toBeNull();
  });

  it('la acepta, la recibe y la entrega, en ese orden', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Aceptar' }),
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Ya la recibí' }),
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Ya la entregué' }),
    );
    await waitFor(() =>
      expect(
        pantalla.queryByRole('button', { name: 'Ya la entregué' }),
      ).toBeNull(),
    );
    expect(await pantalla.findByText('Últimas cerradas')).toBeTruthy();
  });

  it('para rechazar hay que dar un motivo, que le queda al pasajero', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(await pantalla.findByText('Rechazar'));
    const confirmar = await pantalla.findByRole('button', {
      name: 'Rechazar y avisar',
    });
    expect(confirmar.props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await fireEvent.press(pantalla.getByText('No hay espacio en el bus'));
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Rechazar y avisar' }),
    );
    expect(
      await pantalla.findByText('Motivo: No hay espacio en el bus'),
    ).toBeTruthy();
    const guardado = await AsyncStorage.getItem('anden.encomiendas');
    expect(guardado).toContain('No hay espacio en el bus');
  });

  it('sin encomiendas explica cuándo aparecen', async () => {
    await AsyncStorage.setItem('anden.encomiendas', '[]');
    const pantalla = await dibujar();
    expect(
      await pantalla.findByText(/Todavía no hay encomiendas para tus viajes/),
    ).toBeTruthy();
  });
});
