import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import {
  autenticar,
  consultarBiometria,
  type EstadoBiometria,
} from './biometria';
import {
  debeBloquear,
  guardarBloqueoActivo,
  leerBloqueoActivo,
} from './bloqueo';
import { ContextoBloqueo, type ValorBloqueo } from './useBloqueo';
import { t } from '@/textos/t';

/** bloquea la app con Face ID al abrirla y al volver tras un rato en segundo plano */
export function ProveedorBloqueo({ children }: { children: ReactNode }) {
  const [activo, establecerActivo] = useState(false);
  const [bloqueado, establecerBloqueado] = useState(false);
  const [cargando, establecerCargando] = useState(true);
  const [biometria, establecerBiometria] = useState<EstadoBiometria>({
    disponible: false,
    tipo: 'ninguna',
  });
  const salida = useRef<number | null>(null);

  useEffect(() => {
    let vigente = true;
    void Promise.all([leerBloqueoActivo(), consultarBiometria()]).then(
      ([guardado, estado]) => {
        if (!vigente) return;
        // sin biometría configurada no se puede bloquear: se evita dejar a alguien afuera
        const encendido = guardado && estado.disponible;
        establecerBiometria(estado);
        establecerActivo(encendido);
        establecerBloqueado(encendido);
        establecerCargando(false);
      },
    );
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'background') {
        salida.current = Date.now();
        return;
      }
      if (estado === 'active' && salida.current !== null) {
        const segundos = (Date.now() - salida.current) / 1000;
        salida.current = null;
        if (debeBloquear(activo, segundos)) establecerBloqueado(true);
      }
    });
    return () => suscripcion.remove();
  }, [activo]);

  const activar = useCallback(async () => {
    const estado = await consultarBiometria();
    establecerBiometria(estado);
    if (!estado.disponible) return false;
    const confirmado = await autenticar(t('bloqueo.motivoActivar'));
    if (!confirmado) return false;
    await guardarBloqueoActivo(true);
    establecerActivo(true);
    return true;
  }, []);

  const desactivar = useCallback(async () => {
    const confirmado = await autenticar(t('bloqueo.motivoDesactivar'));
    if (!confirmado) return false;
    await guardarBloqueoActivo(false);
    establecerActivo(false);
    return true;
  }, []);

  const desbloquear = useCallback(async () => {
    const confirmado = await autenticar(t('bloqueo.motivo'));
    if (confirmado) establecerBloqueado(false);
    return confirmado;
  }, []);

  const valor = useMemo<ValorBloqueo>(
    () => ({
      activar,
      activo,
      biometria,
      bloqueado,
      cargando,
      desactivar,
      desbloquear,
    }),
    [activar, activo, biometria, bloqueado, cargando, desactivar, desbloquear],
  );

  return (
    <ContextoBloqueo.Provider value={valor}>
      {children}
    </ContextoBloqueo.Provider>
  );
}
