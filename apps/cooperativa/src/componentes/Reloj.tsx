import { useEffect, useState } from 'react';

export function useAhora(): Date {
  const [ahora, establecerAhora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => establecerAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return ahora;
}

export function Reloj() {
  const ahora = useAhora();
  return (
    <time dateTime={ahora.toISOString()}>
      {ahora.toLocaleTimeString('es-NI', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </time>
  );
}
