/**
 * Modelo de marcas de vehículos: reglas puras de normalización y validación.
 * No hace peticiones de red (eso vive en services/marcasApi.ts).
 */

/**
 * Lista base local. Se usa siempre como complemento de la API (marcas comunes
 * en el mercado local, incluidas las asiáticas que NHTSA no siempre lista) y
 * como respaldo completo si no hay internet.
 */
export const MARCAS_BASE: string[] = [
  'Acura', 'Alfa Romeo', 'Audi', 'BAIC', 'BMW', 'Buick', 'BYD', 'Cadillac',
  'Changan', 'Chery', 'Chevrolet', 'Chrysler', 'Citroën', 'Dodge', 'DFSK',
  'Dongfeng', 'Ferrari', 'Fiat', 'Ford', 'Foton', 'Geely', 'GMC', 'Great Wall',
  'Haval', 'Honda', 'Hummer', 'Hyundai', 'Infiniti', 'Isuzu', 'JAC', 'Jaguar',
  'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln', 'Mahindra', 'Maserati',
  'Mazda', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel',
  'Peugeot', 'Porsche', 'RAM', 'Renault', 'Seat', 'Skoda', 'SsangYong',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

/** Abreviaturas / nombres coloquiales frecuentes → marca oficial. */
const ALIAS: Record<string, string> = {
  VW: 'Volkswagen',
  CHEVY: 'Chevrolet',
  MERCEDES: 'Mercedes-Benz',
  BENZ: 'Mercedes-Benz',
  MERCEDESBENZ: 'Mercedes-Benz',
  LANDROVER: 'Land Rover',
  ROVER: 'Land Rover',
  GREATWALL: 'Great Wall',
  SSANGYONG: 'SsangYong',
};

/** Marcas que se muestran en mayúsculas al formatear nombres de la API. */
const SIGLAS = new Set(['BMW', 'GMC', 'MG', 'BYD', 'JAC', 'RAM', 'BAIC', 'DFSK', 'FAW', 'DS', 'KTM', 'MV']);

export interface ResultadoValidacionMarca {
  valida: boolean;
  /** Nombre oficial de la marca (solo si es válida). */
  marcaCanonica?: string;
  /** Marcas parecidas para ofrecer al usuario (solo si es inválida). */
  sugerencias: string[];
  mensaje?: string;
}

export type IndiceMarcas = Map<string, string>;

/** "Mercedes-Benz", "mercedes benz" y "MERCEDESBENZ" → "MERCEDESBENZ" */
export function normalizarMarca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Convierte "LAND ROVER" (formato NHTSA) en "Land Rover". */
export function formatearNombreMarca(nombre: string): string {
  const limpio = nombre.trim().replace(/\s+/g, ' ');
  if (SIGLAS.has(limpio.toUpperCase())) return limpio.toUpperCase();
  return limpio
    .toLowerCase()
    .replace(/(^|[\s\-])([a-zñáéíóúü])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * Construye el índice normalizado → nombre a mostrar.
 * Los nombres de MARCAS_BASE tienen prioridad para el formato (p. ej. "BMW").
 */
export function construirIndice(marcasExternas: string[]): IndiceMarcas {
  const indice: IndiceMarcas = new Map();
  MARCAS_BASE.forEach(m => indice.set(normalizarMarca(m), m));
  marcasExternas.forEach(m => {
    const clave = normalizarMarca(m);
    if (clave && !indice.has(clave)) indice.set(clave, formatearNombreMarca(m));
  });
  return indice;
}

function distanciaLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diagonal = temp;
    }
  }
  return prev[b.length];
}

function buscarSugerencias(clave: string, indice: IndiceMarcas, max = 3): string[] {
  const candidatos: { nombre: string; puntaje: number }[] = [];
  const tolerancia = clave.length <= 4 ? 1 : 2;

  indice.forEach((nombre, claveMarca) => {
    let puntaje: number | null = null;
    const dist = distanciaLevenshtein(clave, claveMarca);
    if (dist <= tolerancia) puntaje = dist;
    else if (clave.length >= 3 && (claveMarca.startsWith(clave) || clave.startsWith(claveMarca))) puntaje = 1.5;
    else if (clave.length >= 4 && claveMarca.includes(clave)) puntaje = 2.5;
    if (puntaje !== null) candidatos.push({ nombre, puntaje });
  });

  return candidatos
    .sort((a, b) => a.puntaje - b.puntaje || a.nombre.localeCompare(b.nombre))
    .slice(0, max)
    .map(c => c.nombre);
}

export function validarMarca(entrada: string, indice: IndiceMarcas): ResultadoValidacionMarca {
  const clave = normalizarMarca(entrada);

  if (!clave) {
    return { valida: false, sugerencias: [], mensaje: 'Ingrese la marca del vehículo.' };
  }

  const exacta = indice.get(clave);
  if (exacta) return { valida: true, marcaCanonica: exacta, sugerencias: [] };

  const alias = ALIAS[clave];
  if (alias) return { valida: true, marcaCanonica: alias, sugerencias: [] };

  const sugerencias = buscarSugerencias(clave, indice);
  return {
    valida: false,
    sugerencias,
    mensaje: sugerencias.length
      ? `"${entrada.trim()}" no es una marca reconocida. ¿Quiso decir alguna de estas?`
      : `"${entrada.trim()}" no es una marca reconocida. Seleccione una de la lista.`,
  };
}
