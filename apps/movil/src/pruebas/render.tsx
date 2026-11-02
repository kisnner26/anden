import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const MEDIDAS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
};

/** dibuja una pantalla dentro del área segura de un iPhone de 390 por 844 */
export function renderPantalla(pantalla: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={MEDIDAS}>{pantalla}</SafeAreaProvider>,
  );
}
