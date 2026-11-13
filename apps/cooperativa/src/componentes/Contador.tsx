import { useEffect, useRef, useState } from 'react';

/** un número que sube desde el anterior hasta el nuevo; con «reducir movimiento» salta directo */
export function Contador({
  prefijo = '',
  valor,
}: {
  prefijo?: string;
  valor: number;
}) {
  const [mostrado, establecerMostrado] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    const reducir = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const desde = anterior.current;
    anterior.current = valor;
    if (reducir || desde === valor) {
      establecerMostrado(valor);
      return;
    }
    const inicio = performance.now();
    let cuadro = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / 900);
      const suave = 1 - Math.pow(1 - t, 3);
      establecerMostrado(Math.round(desde + (valor - desde) * suave));
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor]);

  return <>{`${prefijo}${mostrado.toLocaleString('es-NI')}`}</>;
}
