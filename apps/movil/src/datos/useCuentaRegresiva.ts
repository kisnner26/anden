import { useEffect, useState } from 'react';

/** segundos que faltan, bajando de uno en uno hasta llegar a cero */
export function useCuentaRegresiva(segundosIniciales: number): number {
  const [restantes, establecerRestantes] = useState(segundosIniciales);
  useEffect(() => {
    const temporizador = setInterval(
      () => establecerRestantes((actual) => Math.max(0, actual - 1)),
      1000,
    );
    return () => clearInterval(temporizador);
  }, []);
  return restantes;
}

/** formato mm:ss de una cantidad de segundos */
export function formatoCuenta(segundos: number): string {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const resto = String(segundos % 60).padStart(2, '0');
  return `${minutos}:${resto}`;
}
