import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSesion } from '@/datos/useSesion';
import { Portada } from '@/pantallas/Portada';
import { esInvitado } from '@/servicios/sesion';

const CLAVE_PORTADA = 'anden.portada';

export default function Inicio() {
  const router = useRouter();
  const { cargando: cargandoSesion, rol, sesion } = useSesion();
  const [vista, establecerVista] = useState<boolean | null>(null);
  const [invitado, establecerInvitado] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_PORTADA)
      .then((valor) => establecerVista(valor === '1'))
      .catch(() => establecerVista(false));
    void esInvitado().then(establecerInvitado);
  }, []);

  if (vista === null || invitado === null || cargandoSesion) return null;
  // quien ya inició sesión entra directo a lo suyo; el rol lo trae la cuenta
  if (rol === 'conductor') return <Redirect href="/conductor" />;
  if (vista) {
    return <Redirect href={sesion || invitado ? '/viajar' : '/ingresar'} />;
  }

  return (
    <Portada
      alEmpezar={() => {
        void AsyncStorage.setItem(CLAVE_PORTADA, '1');
        router.replace(sesion || invitado ? '/viajar' : '/ingresar');
      }}
    />
  );
}
