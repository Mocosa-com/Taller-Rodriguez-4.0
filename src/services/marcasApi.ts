/**
 * Servicio de marcas: obtiene el catálogo desde la API pública vPIC de NHTSA
 * (https://vpic.nhtsa.dot.gov/api/). Es gratuita, no requiere API key y
 * permite peticiones desde el navegador.
 *
 * Estrategia: caché en localStorage (7 días) → API → lista local de respaldo.
 */
import { MARCAS_BASE } from '../models/marcasModel';

const API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';
// Autos, camionetas/pickups y SUV/MPV.
const TIPOS_VEHICULO = ['car', 'truck', 'multipurpose passenger vehicle (mpv)'];
const CACHE_KEY = 'taller_marcas_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 8000;

export type FuenteMarcas = 'api' | 'cache' | 'local';

export interface CatalogoMarcas {
  marcas: string[];
  fuente: FuenteMarcas;
}

interface CacheMarcas {
  ts: number;
  marcas: string[];
}

interface RespuestaNhtsa {
  Results?: Array<{ MakeName?: string; Make_Name?: string }>;
}

function leerCache(): string[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as CacheMarcas;
    if (!Array.isArray(cache.marcas) || Date.now() - cache.ts > CACHE_TTL_MS) return null;
    return cache.marcas;
  } catch {
    return null;
  }
}

function guardarCache(marcas: string[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), marcas } satisfies CacheMarcas));
  } catch {
    /* almacenamiento lleno o bloqueado: no es crítico */
  }
}

async function marcasPorTipo(tipo: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${API_BASE}/GetMakesForVehicleType/${encodeURIComponent(tipo)}?format=json`;
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`NHTSA respondió ${resp.status}`);
    const data = (await resp.json()) as RespuestaNhtsa;
    return (data.Results ?? [])
      .map(r => (r.MakeName ?? r.Make_Name ?? '').trim())
      .filter(Boolean);
  } finally {
    clearTimeout(timer);
  }
}

export async function cargarCatalogoMarcas(): Promise<CatalogoMarcas> {
  const enCache = leerCache();
  if (enCache) return { marcas: enCache, fuente: 'cache' };

  const resultados = await Promise.allSettled(TIPOS_VEHICULO.map(marcasPorTipo));
  const desdeApi = resultados.flatMap(r => (r.status === 'fulfilled' ? r.value : []));

  if (desdeApi.length === 0) {
    return { marcas: MARCAS_BASE, fuente: 'local' };
  }

  const unicas = Array.from(new Set(desdeApi));
  guardarCache(unicas);
  return { marcas: unicas, fuente: 'api' };
}
