import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  ajustesDeModo,
  guardarModoUso,
  leerModoUso,
  type ModoUso,
} from './modoUso';
import { establecerEscalaTexto } from './tipografia';
import { ContextoModoUso } from './useModoUso';

/** comparte el modo de uso y aplica su escala de letra antes de dibujar a quienes lo leen */
export function ProveedorModoUso({ children }: { children: ReactNode }) {
  const [modo, establecerModoLocal] = useState<ModoUso>('completo');
  const ajustes = ajustesDeModo(modo);

  // la escala se fija durante el render: los hijos que leen la tipografía ya la ven aplicada
  establecerEscalaTexto(ajustes.escalaTexto);

  useEffect(() => {
    let vigente = true;
    void leerModoUso().then((guardado) => {
      if (vigente) establecerModoLocal(guardado);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const establecerModo = useCallback(async (nuevo: ModoUso) => {
    establecerModoLocal(nuevo);
    await guardarModoUso(nuevo);
  }, []);

  const valor = useMemo(
    () => ({ ajustes, establecerModo, modo }),
    [ajustes, establecerModo, modo],
  );

  return (
    <ContextoModoUso.Provider value={valor}>
      {children}
    </ContextoModoUso.Provider>
  );
}
