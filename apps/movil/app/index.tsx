import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { perfilVacio } from '@/datos/perfil';
import { usePerfil } from '@/datos/usePerfil';
import { Portada } from '@/pantallas/Portada';

const CLAVE_PORTADA = 'anden.portada';

export default function Inicio() {
  const router = useRouter();
  const { perfil } = usePerfil();
  const [vista, establecerVista] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_PORTADA)
      .then((valor) => establecerVista(valor === '1'))
      .catch(() => establecerVista(false));
  }, []);

  if (vista === null) return null;
  if (vista) return <Redirect href="/viajar" />;

  return (
    <Portada
      alEmpezar={() => {
        void AsyncStorage.setItem(CLAVE_PORTADA, '1');
        // sin cuenta todavía, se ofrece crearla antes de entrar
        router.replace(perfilVacio(perfil) ? '/cuenta' : '/viajar');
      }}
    />
  );
}
