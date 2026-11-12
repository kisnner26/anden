import { useEffect } from 'react';

import { useModoUso } from '@/tema/useModoUso';

import { esPersonaMayor } from './perfil';
import { usePerfil } from './usePerfil';

/** pasa la edad del perfil al modo de uso: una persona mayor recibe la interfaz adaptada sin tocar ajustes */
export function AdaptacionPorEdad() {
  const { perfil } = usePerfil();
  const { establecerMayor } = useModoUso();
  const mayor = esPersonaMayor(perfil.edad);

  useEffect(() => {
    establecerMayor?.(mayor);
  }, [establecerMayor, mayor]);

  return null;
}
