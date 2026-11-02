import { beforeAll, describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { crearMuestra } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { estadoTablero, TableroSalidas } from './TableroSalidas';

const AHORA = new Date(2026, 10, 2, 14, 20);
let salidas: Salida[];

beforeAll(() => {
  salidas = armarSalidas(crearMuestra(AHORA), AHORA);
});

function de(destino: string): Salida {
  return salidas.find((salida) => salida.destino === destino) as Salida;
}

describe('estadoTablero', () => {
  it('dice "Salió" y usa una raya si ya partió', () => {
    expect(estadoTablero(de('Masaya'))).toMatchObject({
      forma: 'raya',
      texto: 'Salió',
    });
  });

  it('dice "Abordando" con un punto desde 20 minutos antes', () => {
    expect(estadoTablero(de('Granada'))).toMatchObject({
      forma: 'punto',
      texto: 'Abordando',
    });
  });

  it('dice "A tiempo" con un anillo si está programada', () => {
    expect(estadoTablero(de('Diriamba'))).toMatchObject({
      forma: 'anillo',
      texto: 'A tiempo',
    });
  });

  it('muestra los minutos de atraso con un rombo', () => {
    expect(estadoTablero(de('León'))).toMatchObject({
      forma: 'rombo',
      texto: '+10 min',
    });
  });
});

describe('TableroSalidas', () => {
  it('muestra una fila por salida con su resumen accesible', async () => {
    const pantalla = await render(<TableroSalidas salidas={salidas} />);
    expect(pantalla.getByLabelText('Granada, 2:40, Abordando')).toBeTruthy();
    expect(pantalla.getByLabelText('León, 2:52, +10 min')).toBeTruthy();
  });

  it('muestra los encabezados de las columnas', async () => {
    const pantalla = await render(<TableroSalidas salidas={salidas} />);
    expect(pantalla.getByText('Hora')).toBeTruthy();
    expect(pantalla.getByText('Destino')).toBeTruthy();
    expect(pantalla.getByText('Andén')).toBeTruthy();
    expect(pantalla.getByText('Estado')).toBeTruthy();
  });
});
