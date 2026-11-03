import type { BoletoGuardado } from '@/datos/reserva';

/** un boleto de muestra para las pruebas, con la salida y el asiento que se le indiquen */
export function boletoDePrueba(
  salida: Date,
  asiento = 8,
  codigo = 'K7RM4QX9',
): BoletoGuardado {
  return {
    boleto: {
      asiento,
      codigo,
      compradoEn: salida.toISOString(),
      duenoId: 'usu_yo',
      estado: 'vigente',
      id: `bol_${codigo}`,
      pasajero: { esMenorEnBrazos: false, nombre: 'Ana Ruiz' },
      precio: 46,
      viajeId: 'via_2',
    },
    resumen: {
      anden: 4,
      choferId: 'cho_2',
      choferNombre: 'Marvin Lanzas',
      cooperativa: 'Cooperativa de muestra',
      destino: 'Granada',
      metodoPago: 'efectivo-al-abordar',
      placa: 'M 222-114',
      salida: salida.toISOString(),
      servicio: 'ordinario',
    },
  };
}
