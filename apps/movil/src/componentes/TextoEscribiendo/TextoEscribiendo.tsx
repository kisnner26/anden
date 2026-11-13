import { useEffect, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { movimiento } from '@/tema/movimiento';
import { useMovimientoReducido } from '@/tema/useMovimientoReducido';

export interface PropiedadesTextoEscribiendo {
  /** se llama cuando termina de escribirse */
  alTerminar?: () => void;
  /** si es falso el texto aparece completo, sin escribirse */
  animado?: boolean;
  estilo?: StyleProp<TextStyle>;
  texto: string;
}

/** muestra el texto letra por letra, como si la IA lo estuviera escribiendo */
export function TextoEscribiendo({
  alTerminar,
  animado = true,
  estilo,
  texto,
}: PropiedadesTextoEscribiendo) {
  const reducir = useMovimientoReducido();
  const instantaneo = !animado || reducir;
  const [letras, establecerLetras] = useState(instantaneo ? texto.length : 0);

  useEffect(() => {
    if (instantaneo) {
      establecerLetras(texto.length);
      return;
    }
    establecerLetras(0);
    // se escribe de a varias letras por tick si el texto es largo, para que no tarde demasiado
    const paso = Math.max(1, Math.ceil(texto.length / 220));
    const temporizador = setInterval(() => {
      establecerLetras((actual) => {
        const siguiente = Math.min(texto.length, actual + paso);
        if (siguiente >= texto.length) clearInterval(temporizador);
        return siguiente;
      });
    }, movimiento.letraEscrita);
    return () => clearInterval(temporizador);
  }, [instantaneo, texto]);

  const completo = letras >= texto.length && texto.length > 0;
  useEffect(() => {
    if (completo) alTerminar?.();
  }, [alTerminar, completo]);

  return (
    <Text accessibilityLabel={texto} selectable style={estilo}>
      {texto.slice(0, letras)}
    </Text>
  );
}
