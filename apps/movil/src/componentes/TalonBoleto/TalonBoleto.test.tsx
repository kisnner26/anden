import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import type { BoletoGuardado } from '@/datos/reserva';

import { TalonBoleto } from './TalonBoleto';

const GUARDADO: BoletoGuardado = {
  boleto: {
    asiento: 8,
    codigo: 'K7RM4QX9',
    compradoEn: '2026-11-02T13:50:00-06:00',
    duenoId: 'usu_yo',
    estado: 'vigente',
    id: 'bol_K7RM4QX9',
    pasajero: { esMenorEnBrazos: false, nombre: 'Ana Ruiz' },
    precio: 46,
    viajeId: 'via_2',
  },
  resumen: {
    anden: 4,
    choferId: 'cho_2',
    choferNombre: 'Marvin Lanzas',
    cooperativa: 'Cooperativa de muestra',
    destino: 'Granada',
    metodoPago: 'efectivo-al-abordar',
    placa: 'M 222-114',
    salida: new Date(2026, 10, 2, 14, 40).toISOString(),
    servicio: 'ordinario',
  },
};

describe('TalonBoleto', () => {
  it('muestra el destino y el precio', async () => {
    const pantalla = await render(<TalonBoleto guardado={GUARDADO} />);
    expect(pantalla.getByText('UCA → Granada.')).toBeTruthy();
    expect(pantalla.getByText('C$ 46')).toBeTruthy();
  });

  it('muestra fecha, hora, andén, asiento, pasajero, placa y chofer', async () => {
    const pantalla = await render(<TalonBoleto guardado={GUARDADO} />);
    expect(pantalla.getByText('lun 2 nov, 2:40 p. m.')).toBeTruthy();
    expect(pantalla.getByText('4')).toBeTruthy();
    expect(pantalla.getByText('8')).toBeTruthy();
    expect(pantalla.getByText('Ana Ruiz')).toBeTruthy();
    expect(pantalla.getByText('M 222-114')).toBeTruthy();
    expect(pantalla.getByText('Marvin Lanzas')).toBeTruthy();
  });

  it('muestra el código de abordaje en dos grupos y su QR accesible', async () => {
    const pantalla = await render(<TalonBoleto guardado={GUARDADO} />);
    expect(pantalla.getByText('K7RM 4QX9')).toBeTruthy();
    expect(pantalla.getByLabelText('QR K7RM4QX9')).toBeTruthy();
  });

  it('se anuncia completo con el código', async () => {
    const pantalla = await render(<TalonBoleto guardado={GUARDADO} />);
    expect(
      pantalla.getByLabelText('Tu boleto Granada, Código de abordaje K7RM4QX9'),
    ).toBeTruthy();
  });
});
