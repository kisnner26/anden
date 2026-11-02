import { estadoAsientos } from './asientos';
import { calcularPrecio } from './precio';
import { estadoViaje, llegadaEstimada, ventaAbierta } from './horarios';
import type { DatosViajes, FiltroBusqueda, Ruta, Tramo } from './tipos';

export interface ResultadoViaje {
  viaje: DatosViajes['viajes'][number];
  ruta: Ruta;
  bus: DatosViajes['buses'][number];
  chofer: DatosViajes['choferes'][number];
  tramo: Tramo;
  salidaOrigen: string;
  llegadaDestino: string;
  precioUnitario: number;
  asientosLibres: number;
  ventaAbierta: boolean;
  estado: ReturnType<typeof estadoViaje>;
}

function franja(fecha: Date): string {
  const h = fecha.toLocaleString('en-US', {
    timeZone: 'America/Managua',
    hour: '2-digit',
    hour12: false,
  });
  const n = Number(h);
  return n < 6 ? 'madrugada' : n < 12 ? 'manana' : n < 18 ? 'tarde' : 'noche';
}
function isoLocal(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA', { timeZone: 'America/Managua' });
}
function tramoDe(
  ruta: Ruta,
  origenId: string,
  destinoId: string,
): Tramo | null {
  const desde = ruta.paradas.findIndex(
    (p) => p.tipo === 'terminal' && p.terminalId === origenId,
  );
  const hasta = ruta.paradas.findIndex(
    (p, i) => i > desde && p.tipo === 'terminal' && p.terminalId === destinoId,
  );
  return desde >= 0 && hasta > desde ? { desde, hasta } : null;
}

export function buscarViajes(
  filtro: FiltroBusqueda,
  datos: DatosViajes,
  ahora: Date,
): ResultadoViaje[] {
  return datos.viajes
    .flatMap((viaje) => {
      const ruta = datos.rutas.find((x) => x.id === viaje.rutaId);
      const bus = datos.buses.find((x) => x.id === viaje.busId);
      const chofer = datos.choferes.find((x) => x.id === viaje.choferId);
      if (!ruta || !bus || !chofer || viaje.estado === 'cancelado') return [];
      const tramo = tramoDe(ruta, filtro.origenId, filtro.destinoId);
      if (!tramo) return [];
      const origen = ruta.paradas[tramo.desde]!;
      const destino = ruta.paradas[tramo.hasta]!;
      const salidaOrigen = new Date(
        new Date(viaje.salida).getTime() +
          (viaje.minutosAtraso + origen.minutosDesdeOrigen) * 60000,
      );
      if (
        salidaOrigen < ahora ||
        isoLocal(salidaOrigen) !== filtro.fecha ||
        (filtro.tipos && !filtro.tipos.includes(bus.tipo)) ||
        (filtro.franja && franja(salidaOrigen) !== filtro.franja)
      )
        return [];
      const libres = estadoAsientos(
        bus.configuracion,
        datos.ocupaciones.filter((o) => o.viajeId === viaje.id),
        ahora,
      ).filter((a) => a.estado === 'libre').length;
      const precio = calcularPrecio(ruta, tramo, bus.tipo, [
        { nombre: 'pasajero', esMenorEnBrazos: false },
      ]);
      if (libres < filtro.pasajeros || !precio.ok) return [];
      const llegada = llegadaEstimada(viaje, ruta, destino);
      if (!llegada) return [];
      return [
        {
          viaje,
          ruta,
          bus,
          chofer,
          tramo,
          salidaOrigen: salidaOrigen.toISOString(),
          llegadaDestino: llegada,
          precioUnitario: precio.valor.unitario,
          asientosLibres: libres,
          ventaAbierta: ventaAbierta(viaje, ahora),
          estado: estadoViaje(viaje, ruta, ahora),
        },
      ];
    })
    .sort(
      (a, b) =>
        a.salidaOrigen.localeCompare(b.salidaOrigen) ||
        a.precioUnitario - b.precioUnitario,
    );
}
