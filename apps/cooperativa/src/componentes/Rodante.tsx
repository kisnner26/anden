import { useEffect, useState } from 'react';

const GLIFOS = 'ABCDEFGHJKLMNPRSTUVXYZ0123456789';

/** texto que se acomoda letra por letra, como un tablero de salidas de terminal */
export function Rodante({
  demora = 0,
  texto,
}: {
  demora?: number;
  texto: string;
}) {
  const [visible, establecerVisible] = useState(texto);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      establecerVisible(texto);
      return;
    }
    let cuadro = 0;
    const temporizador = setTimeout(() => {
      let pasos = 0;
      const intervalo = setInterval(() => {
        pasos += 1;
        establecerVisible(
          [...texto]
            .map((letra, i) =>
              letra === ' ' || i < pasos / 2
                ? letra
                : (GLIFOS[Math.floor(Math.random() * GLIFOS.length)] ?? letra),
            )
            .join(''),
        );
        if (pasos >= texto.length * 2 + 2) {
          clearInterval(intervalo);
          establecerVisible(texto);
        }
      }, 38);
      cuadro = intervalo as unknown as number;
    }, demora);
    return () => {
      clearTimeout(temporizador);
      clearInterval(cuadro);
    };
  }, [demora, texto]);

  return <span aria-label={texto}>{visible}</span>;
}
