import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** true mientras la app está a la vista: las animaciones sin fin se detienen en segundo plano para no gastar batería */
export function useAppActiva(): boolean {
  const [activa, establecerActiva] = useState(
    AppState.currentState === 'active',
  );
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) =>
      establecerActiva(estado === 'active'),
    );
    return () => suscripcion.remove();
  }, []);
  return activa;
}
