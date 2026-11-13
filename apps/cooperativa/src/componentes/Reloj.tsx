import { useEffect, useState } from 'react';

/** la hora de Nicaragua corriendo, para que el panel se sienta vivo */
export function Reloj() {
  const [ahora, establecerAhora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => establecerAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
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
