import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSesion } from '@/datos/useSesion';
import { Portada } from '@/pantallas/Portada';
import { esInvitado } from '@/servicios/sesion';

export default function Inicio() {
  const router = useRouter();
  const { cargando: cargandoSesion, rol, sesion } = useSesion();
  const [invitado, establecerInvitado] = useState<boolean | null>(null);

  useEffect(() => {
    void esInvitado().then(establecerInvitado);
  }, []);

  if (invitado === null || cargandoSesion) return null;

  // la portada se ve cada vez que se abre la app; después cada cuenta va a lo suyo
  return (
    <Portada
      alEmpezar={() => {
        if (rol === 'conductor') router.replace('/conductor');
        else router.replace(sesion || invitado ? '/viajar' : '/ingresar');
      }}
    />
  );
}
