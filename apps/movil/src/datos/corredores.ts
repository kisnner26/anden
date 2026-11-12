export interface CorredorInterlocal {
  destino: 'Boaco' | 'Juigalpa' | 'Managua';
  id: 'cor_boa_man' | 'cor_jui_man' | 'cor_man_boa' | 'cor_man_jui';
  origen: 'Boaco' | 'Juigalpa' | 'Managua';
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

/** la terminal de cada ciudad en los datos de muestra */
export const TERMINAL_POR_CIUDAD: Readonly<
  Record<CorredorInterlocal['origen'], string>
> = {
  Boaco: 'ter_boa',
  Juigalpa: 'ter_jui',
  Managua: 'ter_may',
};
