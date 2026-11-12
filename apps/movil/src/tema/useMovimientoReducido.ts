import { useReducedMotion } from 'react-native-reanimated';

import { useModoUso } from './useModoUso';

/** true si el sistema pide reducir movimiento o si el modo de uso elegido lo pide */
export function useMovimientoReducido(): boolean {
  const sistema = useReducedMotion();
  const { ajustes } = useModoUso();
  return sistema || ajustes.reducirMovimiento;
}
