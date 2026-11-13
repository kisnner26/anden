/** una barra fina de ocupación con su texto, que se llena con animación */
export function Medidor({
  fraccion,
  texto,
}: {
  fraccion: number;
  texto: string;
}) {
  return (
    <span className="medidor-fila" title={texto}>
      <span className="medidor">
        <i style={{ width: `${Math.round(fraccion * 100)}%` }} />
      </span>
      <span className="num">{texto}</span>
    </span>
  );
}
