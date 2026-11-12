import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

import {
  cancelarRecordatorio,
  leerPermiso,
  pedirPermiso,
  programarRecordatorio,
} from './notificaciones';
import {
  conRecordatorio,
  cuandoRecordar,
  guardarRecordatorios,
  leerRecordatorios,
  sinRecordatorio,
  sinVencidos,
  type RecordatorioSalida,
} from './recordatorios';
import {
  ContextoRecordatorios,
  type ValorRecordatorios,
} from './useRecordatorios';

/** los avisos que la persona pidió para salidas sin boleto; se programan en el teléfono */
export function ProveedorRecordatorios({ children }: { children: ReactNode }) {
  const [lista, establecerLista] = useState<readonly RecordatorioSalida[]>([]);

  useEffect(() => {
    let vigente = true;
    void leerRecordatorios().then((guardados) => {
      if (!vigente) return;
      const activos = sinVencidos(guardados, new Date());
      establecerLista(activos);
      if (activos.length !== guardados.length) {
        void guardarRecordatorios(activos);
      }
    });
    return () => {
      vigente = false;
    };
  }, []);

  const persistir = useCallback(
    async (nueva: readonly RecordatorioSalida[]) => {
      establecerLista(nueva);
      await guardarRecordatorios(nueva);
    },
    [],
  );

  const quitar = useCallback<ValorRecordatorios['quitar']>(
    async (viajeId) => {
      const existente = lista.find((r) => r.viajeId === viajeId);
      if (!existente) return;
      try {
        await cancelarRecordatorio(existente.identificador);
      } catch {
        /* ya había sonado o no existe: igual se quita de la lista */
      }
      await persistir(sinRecordatorio(lista, viajeId));
    },
    [lista, persistir],
  );

  const programar = useCallback<ValorRecordatorios['programar']>(
    async (salida, minutosAntes) => {
      const cuando = cuandoRecordar(
        salida.salida,
        salida.minutosAtraso,
        minutosAntes,
      );
      if (cuando.getTime() <= Date.now()) return 'ya-paso';

      try {
        const permiso = await leerPermiso();
        const estado = permiso === 'concedido' ? permiso : await pedirPermiso();
        if (estado !== 'concedido') return 'permiso-negado';

        const anterior = lista.find((r) => r.viajeId === salida.viajeId);
        if (anterior) {
          try {
            await cancelarRecordatorio(anterior.identificador);
          } catch {
            /* ya no existía */
          }
        }
        const identificador = await programarRecordatorio({
          anden: salida.anden,
          cuando,
          destino: salida.destino,
          texto: {
            cuerpo: rellenar(t('recordatorios.cuerpo'), {
              anden: salida.anden,
            }),
            titulo: rellenar(t('recordatorios.titulo'), {
              destino: salida.destino,
              minutos: minutosAntes,
            }),
          },
        });
        await persistir(
          conRecordatorio(lista, {
            anden: salida.anden,
            destino: salida.destino,
            identificador,
            minutosAntes,
            salida: salida.salida.toISOString(),
            viajeId: salida.viajeId,
          }),
        );
      } catch {
        return 'fallo';
      }
      return 'listo';
    },
    [lista, persistir],
  );

  const valor = useMemo<ValorRecordatorios>(
    () => ({
      de: (viajeId) => lista.find((r) => r.viajeId === viajeId),
      programar,
      quitar,
      recordatorios: lista,
    }),
    [lista, programar, quitar],
  );

  return (
    <ContextoRecordatorios.Provider value={valor}>
      {children}
    </ContextoRecordatorios.Provider>
  );
}
