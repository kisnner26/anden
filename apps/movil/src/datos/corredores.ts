export interface CorredorInterlocal {
  destino: 'Boaco' | 'Juigalpa' | 'Managua';
  id: 'cor_boa_man' | 'cor_jui_man' | 'cor_man_boa' | 'cor_man_jui';
  origen: 'Boaco' | 'Juigalpa' | 'Managua';
}

export interface OperacionCorredorMuestra {
  estado: 'proxima' | 'sin_servicio';
  proximaSalida: string | null;
}

export const CORREDORES_INICIALES: readonly CorredorInterlocal[] = [
  {
    destino: 'Managua',
    id: 'cor_boa_man',
    origen: 'Boaco',
  },
  {
    destino: 'Boaco',
    id: 'cor_man_boa',
    origen: 'Managua',
  },
  {
    destino: 'Juigalpa',
    id: 'cor_man_jui',
    origen: 'Managua',
  },
  {
    destino: 'Managua',
    id: 'cor_jui_man',
    origen: 'Juigalpa',
  },
];

export const OPERACION_MUESTRA_POR_CORREDOR: Readonly<
  Record<CorredorInterlocal['id'], OperacionCorredorMuestra>
> = {
  cor_boa_man: {
    estado: 'proxima',
    proximaSalida: '6:30 a. m.',
  },
  cor_jui_man: {
    estado: 'sin_servicio',
    proximaSalida: null,
  },
  cor_man_boa: {
    estado: 'proxima',
    proximaSalida: '6:35 a. m.',
  },
  cor_man_jui: {
    estado: 'proxima',
    proximaSalida: '6:43 a. m.',
  },
};

/** la terminal de cada ciudad en los datos de muestra */
export const TERMINAL_POR_CIUDAD: Readonly<
  Record<CorredorInterlocal['origen'], string>
> = {
  Boaco: 'ter_boa',
  Juigalpa: 'ter_jui',
  Managua: 'ter_may',
};
