import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { TarjetaBoleto } from './TarjetaBoleto';

const AHORA = new Date(2026, 10, 13, 12, 0);
const EN_MINUTOS = (minutos: number) =>
  new Date(AHORA.getTime() + minutos * 60_000);

function dibujar(salida: Date, pasado = false, alPresionar = jest.fn()) {
  return renderPantalla(
    <TarjetaBoleto
      ahora={AHORA}
      alPresionar={alPresionar}
      ancho={320}
      guardado={boletoDePrueba(salida)}
      pasado={pasado}
    />,
  );
}

describe('TarjetaBoleto', () => {
  it('muestra la foto del destino, la cuenta regresiva y el asiento', async () => {
    const p = await dibujar(EN_MINUTOS(90));
    expect(p.getByLabelText('Foto de Boaco')).toBeTruthy();
    expect(p.getByText('Sale en 1 h 30 min')).toBeTruthy();
    expect(p.getByText('8')).toBeTruthy();
    expect(p.getByText('K7RM4QX9')).toBeTruthy();
  });

  it('a menos de tres horas muestra la barra que se llena hacia la salida', async () => {
    const cerca = await dibujar(EN_MINUTOS(60));
    expect(cerca.getByTestId('progreso-boleto')).toBeTruthy();
    const lejos = await dibujar(EN_MINUTOS(600));
    expect(lejos.queryByTestId('progreso-boleto')).toBeNull();
  });

  it('un viaje ya hecho dice que se hizo y no muestra barra', async () => {
    const p = await dibujar(EN_MINUTOS(-60), true);
    expect(p.getByText('Viaje hecho')).toBeTruthy();
    expect(p.queryByTestId('progreso-boleto')).toBeNull();
  });

  it('al tocarla abre el boleto', async () => {
    const alPresionar = jest.fn();
    const p = await dibujar(EN_MINUTOS(90), false, alPresionar);
    await fireEvent.press(
      p.getByRole('button', { name: /^Boaco, .*Asiento 8$/ }),
    );
    expect(alPresionar).toHaveBeenCalledWith('bol_K7RM4QX9');
  });

  it('asiento, encuentro y código van en tres columnas iguales con rótulos cortos', async () => {
    const p = await dibujar(EN_MINUTOS(90));
    expect(p.getByText('Asiento')).toBeTruthy();
    expect(p.getByText('Encuentro')).toBeTruthy();
    expect(p.getByText('Código')).toBeTruthy();
    expect(p.getByText('4PPX+HH')).toBeTruthy();
    for (const valor of ['8', '4PPX+HH', 'K7RM4QX9']) {
      const texto = p.getByText(valor);
      expect(texto.props.numberOfLines).toBe(1);
      expect(texto.props.adjustsFontSizeToFit).toBe(true);
    }
  });
});
