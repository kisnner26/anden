import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** solo "background" e "inactive" cuentan como fuera de vista; un estado desconocido (pruebas, web) se trata como a la vista */
function aLaVista(estado: string | null | undefined): boolean {
  return estado !== 'background' && estado !== 'inactive';
}

/** true mientras la app está a la vista: las animaciones sin fin se detienen en segundo plano para no gastar batería */
export function useAppActiva(): boolean {
  const [activa, establecerActiva] = useState(aLaVista(AppState.currentState));
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) =>
      establecerActiva(aLaVista(estado)),
    );
    return () => suscripcion.remove();
  }, []);
  return activa;
}
