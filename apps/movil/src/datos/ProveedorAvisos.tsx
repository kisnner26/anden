import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { avisosDeBoletos, avisosDeEspera, momentoRecordatorio } from './avisos';
import {
  cancelarRecordatorio,
  leerPermiso,
  mostrarAvisosConLaAppAbierta,
  pedirPermiso,
  programarRecordatorio,
  type PermisoNotificaciones,
} from './notificaciones';
import { textoRecordatorio } from './textoAviso';
import { ContextoAvisos, type ValorAvisos } from './useAvisos';
import { useBoletos } from './useBoletos';
import { useEspera } from './useEspera';
import { useSalidas } from './useSalidas';

export const CLAVE_AVISOS = 'anden.avisos';

interface Guardado {
  activadas: boolean;
  leidos: string[];
  /** boleto -> identificador del recordatorio programado en el teléfono */
  programados: Record<string, string>;
}

const VACIO: Guardado = { activadas: false, leidos: [], programados: {} };

function leerGuardado(texto: string | null): Guardado {
  if (!texto) return VACIO;
  try {
    const valor = JSON.parse(texto) as Partial<Guardado>;
    return {
      activadas: valor.activadas === true,
      leidos: Array.isArray(valor.leidos) ? valor.leidos : [],
      programados:
        valor.programados && typeof valor.programados === 'object'
          ? valor.programados
          : {},
    };
  } catch {
    return VACIO;
  }
}

/**
 * los avisos de los boletos, el interruptor de notificaciones y los recordatorios locales:
 * con permiso y activados, cada boleto vigente tiene su recordatorio 30 minutos antes de salir
 */
export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const { boletos, cargando: cargandoBoletos } = useBoletos();
  const { esperas } = useEspera();
  const { ahora, salidas } = useSalidas();
  const [guardado, establecerGuardado] = useState<Guardado>(VACIO);
  const [permiso, establecerPermiso] =
    useState<PermisoNotificaciones>('sin-preguntar');
  const [listo, establecerListo] = useState(false);
  const sincronizando = useRef(false);

  useEffect(() => {
    let activo = true;
    mostrarAvisosConLaAppAbierta();
    Promise.all([AsyncStorage.getItem(CLAVE_AVISOS), leerPermiso()])
      .then(([texto, estado]) => {
        if (!activo) return;
        establecerGuardado(leerGuardado(texto));
        establecerPermiso(estado);
      })
      .catch(() => undefined)
      .finally(() => {
        if (activo) establecerListo(true);
      });
    return () => {
      activo = false;
    };
  }, []);

  const persistir = useCallback(async (nuevo: Guardado) => {
    establecerGuardado(nuevo);
    await AsyncStorage.setItem(CLAVE_AVISOS, JSON.stringify(nuevo));
  }, []);

  const avisos = useMemo(
    () => [
      ...avisosDeBoletos(boletos, salidas, ahora),
      ...avisosDeEspera(esperas, salidas),
    ],
    [ahora, boletos, esperas, salidas],
  );

  // un recordatorio por boleto vigente; se cancela el de los boletos que ya no lo están
  useEffect(() => {
    if (!listo || cargandoBoletos || sincronizando.current) return;
    if (!guardado.activadas || permiso !== 'concedido') return;

    const programados = { ...guardado.programados };
    const vigentes = boletos.filter(
      ({ boleto }) => boleto.estado === 'vigente',
    );
    const pendientes = vigentes.filter(
      ({ boleto }) => !(boleto.id in programados),
    );
    const sobrantes = Object.keys(programados).filter(
      (id) => !vigentes.some(({ boleto }) => boleto.id === id),
    );
    if (pendientes.length === 0 && sobrantes.length === 0) return;

    sincronizando.current = true;
    void (async () => {
      try {
        for (const id of sobrantes) {
          await cancelarRecordatorio(programados[id] as string);
          delete programados[id];
        }
        for (const { boleto, resumen } of pendientes) {
          const salida = salidas.find((s) => s.viajeId === boleto.viajeId);
          const cuando = momentoRecordatorio(
            new Date(resumen.salida),
            salida?.minutosAtraso ?? 0,
          );
          if (cuando.getTime() <= Date.now()) continue;
          programados[boleto.id] = await programarRecordatorio({
            anden: salida?.anden ?? resumen.anden,
            cuando,
            destino: resumen.destino,
            texto: textoRecordatorio(
              resumen.destino,
              salida?.anden ?? resumen.anden,
            ),
          });
        }
        await persistir({ ...guardado, programados });
      } finally {
        sincronizando.current = false;
      }
    })();
  }, [boletos, cargandoBoletos, guardado, listo, permiso, persistir, salidas]);

  const activar = useCallback<ValorAvisos['activar']>(async () => {
    const estado = permiso === 'concedido' ? permiso : await pedirPermiso();
    establecerPermiso(estado);
    if (estado !== 'concedido') return false;
    await persistir({ ...guardado, activadas: true });
    return true;
  }, [guardado, permiso, persistir]);

  const desactivar = useCallback<ValorAvisos['desactivar']>(async () => {
    for (const identificador of Object.values(guardado.programados)) {
      await cancelarRecordatorio(identificador);
    }
    await persistir({ ...guardado, activadas: false, programados: {} });
  }, [guardado, persistir]);

  const marcarLeido = useCallback<ValorAvisos['marcarLeido']>(
    async (id) => {
      if (guardado.leidos.includes(id)) return;
      await persistir({ ...guardado, leidos: [...guardado.leidos, id] });
    },
    [guardado, persistir],
  );

  const marcarTodos = useCallback<ValorAvisos['marcarTodos']>(
    () =>
      persistir({
        ...guardado,
        leidos: [...new Set([...guardado.leidos, ...avisos.map((a) => a.id)])],
      }),
    [avisos, guardado, persistir],
  );

  const noLeidos = avisos.filter(
    (aviso) => !guardado.leidos.includes(aviso.id),
  ).length;

  const valor = useMemo(
    () => ({
      activadas: guardado.activadas,
      activar,
      avisos,
      desactivar,
      leidos: guardado.leidos,
      marcarLeido,
      marcarTodos,
      noLeidos,
      permiso,
    }),
    [
      activar,
      avisos,
      desactivar,
      guardado.activadas,
      guardado.leidos,
      marcarLeido,
      marcarTodos,
      noLeidos,
      permiso,
    ],
  );

  return (
    <ContextoAvisos.Provider value={valor}>{children}</ContextoAvisos.Provider>
  );
}
