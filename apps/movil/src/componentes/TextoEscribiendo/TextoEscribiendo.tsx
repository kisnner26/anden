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

/** muestra el texto palabra por palabra, como si la IA lo estuviera escribiendo */
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
    // avanza por palabras: se lee más natural y redibuja muchas menos veces que letra por letra
    const cortes: number[] = [];
    for (let i = 0; i < texto.length; i += 1) {
      if (texto[i] === ' ' || texto[i] === '\n') cortes.push(i + 1);
    }
    cortes.push(texto.length);
    // un texto largo salta de a varias palabras para no tardar demasiado
    const paso = Math.max(1, Math.ceil(cortes.length / 90));
    let indice = 0;
    const temporizador = setInterval(() => {
      indice = Math.min(cortes.length - 1, indice + paso);
      establecerLetras(cortes[indice] ?? texto.length);
      if (indice >= cortes.length - 1) clearInterval(temporizador);
    }, movimiento.palabraEscrita);
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
