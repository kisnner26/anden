import { useEffect, useRef, useState } from 'react';

/** un número que sube desde el anterior hasta el nuevo; con «reducir movimiento» salta directo */
export function Contador({
  prefijo = '',
  sufijo = '',
  valor,
}: {
  prefijo?: string;
  sufijo?: string;
  valor: number;
}) {
  const [mostrado, establecerMostrado] = useState(0);
  const anterior = useRef(0);
  useEffect(() => {
    const desde = anterior.current;
    anterior.current = valor;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      desde === valor
    ) {
      establecerMostrado(valor);
      return;
    }
    const inicio = performance.now();
    let cuadro = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / 800);
      establecerMostrado(
        Math.round(desde + (valor - desde) * (1 - Math.pow(1 - t, 3))),
      );
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor]);
  return <>{`${prefijo}${mostrado.toLocaleString('es-NI')}${sufijo}`}</>;
}
