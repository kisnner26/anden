import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Linking } from 'react-native';

import { AlertaChoque, type FaseAlerta } from '@/componentes/AlertaChoque';
import { publicarAlerta } from '@/servicios/supabase/alertasSupabase';

import { leerContacto, urlSms } from './contactoConfianza';
import {
  esPosibleChoque,
  mensajeDeAlerta,
  NUMERO_EMERGENCIA,
  SEGUNDOS_PARA_CONFIRMAR,
  type MuestraAcelerometro,
} from './deteccionChoque';
import { nombreCompleto } from './perfil';
import { useBoletos } from './useBoletos';
import { usePerfil } from './usePerfil';
import { ContextoSeguridad, type ValorSeguridad } from './useSeguridad';
import { useSesion } from './useSesion';
import { useViajesEnVivo } from './useTransmision';

export const CLAVE_SEGURIDAD = 'anden.deteccionChoque';
const VENTANA_MS = 4000;
const INTERVALO_MS = 50;

/**
 * vigila el acelerómetro mientras hay un viaje en marcha. Si detecta un golpe fuerte seguido de
 * quietud, pregunta si la persona está bien; si no contesta a tiempo, avisa a su contacto de
 * emergencia con la ubicación, deja la alerta en el servidor y ofrece llamar a emergencias.
 */
export function ProveedorSeguridad({ children }: { children: ReactNode }) {
  const { boletos } = useBoletos();
  const { rol, sesion } = useSesion();
  const { perfil } = usePerfil();
  const enVivo = useViajesEnVivo();
  const [activa, establecerActiva] = useState(true);
  const [fase, establecerFase] = useState<FaseAlerta>({ tipo: 'ninguna' });
  const muestras = useRef<MuestraAcelerometro[]>([]);
  const viajeDeLaAlerta = useRef<string | null>(null);

  useEffect(() => {
    void AsyncStorage.getItem(CLAVE_SEGURIDAD)
      .then((valor) => establecerActiva(valor !== '0'))
      .catch(() => undefined);
  }, []);

  // se vigila a quien viaja: un pasajero con boleto vigente que sale pronto o ya salió, o un conductor transmitiendo
  const viajeVigente = useMemo(() => {
    const ahora = Date.now();
    const boleto = boletos.find(({ boleto: b, resumen }) => {
      if (b.estado !== 'vigente') return false;
      const salida = new Date(resumen.salida).getTime();
      return ahora >= salida - 30 * 60_000 && ahora <= salida + 6 * 3_600_000;
    });
    if (boleto) return boleto.boleto.viajeId;
    return rol === 'conductor' && enVivo.length > 0
      ? (enVivo[0] ?? null)
      : null;
  }, [boletos, enVivo, rol]);
  const vigilando = activa && sesion !== null && viajeVigente !== null;

  const alDetectar = useCallback(() => {
    viajeDeLaAlerta.current = viajeVigente;
    establecerFase({ restantes: SEGUNDOS_PARA_CONFIRMAR, tipo: 'pregunta' });
  }, [viajeVigente]);

  useEffect(() => {
    if (!vigilando) return;
    Accelerometer.setUpdateInterval(INTERVALO_MS);
    const suscripcion = Accelerometer.addListener(({ x, y, z }) => {
      const t = Date.now();
      muestras.current.push({ t, x, y, z });
      muestras.current = muestras.current.filter((m) => t - m.t <= VENTANA_MS);
      if (esPosibleChoque(muestras.current)) {
        muestras.current = [];
        alDetectar();
      }
    });
    return () => {
      suscripcion.remove();
      muestras.current = [];
    };
  }, [alDetectar, vigilando]);

  const enviar = useCallback(async () => {
    establecerFase({ tipo: 'enviando' });
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const posicion =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({}));
      lat = posicion.coords.latitude;
      lng = posicion.coords.longitude;
    } catch {
      // sin ubicación igual se avisa
    }
    const nombre = nombreCompleto(perfil) || sesion?.nombre || 'Un pasajero';
    const alerta = { lat, lng, nombre, viajeId: viajeDeLaAlerta.current };
    const [llego, contacto] = await Promise.all([
      publicarAlerta({ ...alerta, tipo: 'choque' }),
      leerContacto(),
    ]);
    if (contacto) {
      // Mensajes se abre con el texto listo: iOS no deja mandarlo sin que la persona toque Enviar
      void Linking.openURL(urlSms(contacto, mensajeDeAlerta(alerta))).catch(
        () => undefined,
      );
    }
    establecerFase({
      conContacto: contacto !== null,
      enServidor: llego,
      tipo: 'enviada',
    });
  }, [perfil, sesion?.nombre]);

  // la cuenta regresiva: cada segundo vibra fuerte y, al llegar a cero, avisa
  useEffect(() => {
    if (fase.tipo !== 'pregunta') return;
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    ).catch(() => undefined);
    const temporizador = setTimeout(() => {
      if (fase.restantes <= 1) void enviar();
      else establecerFase({ restantes: fase.restantes - 1, tipo: 'pregunta' });
    }, 1000);
    return () => clearTimeout(temporizador);
  }, [enviar, fase]);

  const cambiar = useCallback(async (valor: boolean) => {
    establecerActiva(valor);
    await AsyncStorage.setItem(CLAVE_SEGURIDAD, valor ? '1' : '0');
  }, []);

  const valor = useMemo<ValorSeguridad>(
    () => ({ activa, cambiar, vigilando }),
    [activa, cambiar, vigilando],
  );

  return (
    <ContextoSeguridad.Provider value={valor}>
      {children}
      <AlertaChoque
        alEstoyBien={() => establecerFase({ tipo: 'ninguna' })}
        alLlamar={() =>
          void Linking.openURL(`tel:${NUMERO_EMERGENCIA}`).catch(
            () => undefined,
          )
        }
        alAvisarYa={() => void enviar()}
        fase={fase}
      />
    </ContextoSeguridad.Provider>
  );
}
