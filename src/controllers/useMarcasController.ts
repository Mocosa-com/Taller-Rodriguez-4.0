import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MARCAS_BASE,
  ResultadoValidacionMarca,
  construirIndice,
  validarMarca,
} from '../models/marcasModel';
import { FuenteMarcas, cargarCatalogoMarcas } from '../services/marcasApi';

export type EstadoMarcas = 'cargando' | 'listo';

interface MarcasControllerResult {
  /** Marcas ordenadas alfabéticamente, para autocompletar. */
  marcas: string[];
  estado: EstadoMarcas;
  fuente: FuenteMarcas;
  validar: (entrada: string) => ResultadoValidacionMarca;
}

export function useMarcasController(): MarcasControllerResult {
  const [marcasExternas, setMarcasExternas] = useState<string[]>([]);
  const [estado, setEstado] = useState<EstadoMarcas>('cargando');
  const [fuente, setFuente] = useState<FuenteMarcas>('local');

  useEffect(() => {
    let cancelado = false;
    cargarCatalogoMarcas()
      .then(({ marcas, fuente }) => {
        if (cancelado) return;
        setMarcasExternas(marcas);
        setFuente(fuente);
      })
      .catch(() => {
        /* se queda con la lista local */
      })
      .finally(() => {
        if (!cancelado) setEstado('listo');
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Con la lista base disponible desde el primer render, se puede validar aunque la API aún no responda.
  const indice = useMemo(() => construirIndice(marcasExternas.length ? marcasExternas : MARCAS_BASE), [marcasExternas]);
  const marcas = useMemo(() => Array.from(indice.values()).sort((a, b) => a.localeCompare(b)), [indice]);
  const validar = useCallback((entrada: string) => validarMarca(entrada, indice), [indice]);

  return { marcas, estado, fuente, validar };
}
