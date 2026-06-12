export interface Usuario {
  id: string;
  nombre: string;
  dui: string;
  telefono: string;
  correo?: string;
  cargo: 'Administrador' | 'Recepcionista' | 'Mecánico' | 'Súper Usuario';
  sueldoBase: number;
  porcentajeGanancia?: number; // e.g. 55 for 55%
  fechaContratacion: string;
  tieneLicencia: boolean;
  avatarUrl?: string;
  password?: string;
}

export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  estado: 'En revisión' | 'En espera' | 'Entregado';
  fechaIngreso: string;
  fechaSalida?: string;
  diagnostico: string;
  clienteId: string;
  empleadoId?: string; // Mechanic assigned
  fotoUrl?: string;
  tarjetaUrlFront?: string;
  tarjetaUrlBack?: string;
  trabajosRealizados: string[];
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  dui: string;
  correo: string;
  nit?: string;
  nrc?: string;
  frecuenciaVisita: 'Frecuente' | 'Regular' | 'Muy poco';
  direccion: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  tipo: 'Producto' | 'Servicio';
  stock: number;
  compra: number;
  venta: number;
  proveedor: string;
  clasificacion: string;
  stockMinimo: number;
  stockMaximo: number;
  descripcion: string;
}

export interface Oferta {
  id: string;
  nombre: string;
  descripcion: string;
  porcentajeDescuento: number;
  idProducto?: string; // Optional product restriction
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  locacion: string;
  correo: string;
  tipo: 'Nacional' | 'Internacional';
  pais?: string;
}

export interface FacturaItem {
  productoId: string;
  nombre: string;
  tipo: 'Producto' | 'Servicio';
  cantidad: number;
  precioUnitario: number;
}

export interface Factura {
  id: string;
  codigo: string;
  clienteId: string;
  clienteNombre: string;
  vehiculoId?: string;
  vehiculoPlaca?: string;
  tipo: 'Consumidor Final' | 'Crédito Fiscal';
  total: number;
  fecha: string;
  items: FacturaItem[];
  ofertaId?: string;
  descuento?: number;
  estado: 'Activa' | 'Anulada';
}

export interface TurnoCaja {
  id: string;
  turnoNumero: number;
  fecha: string;
  responsableId: string;
  responsableNombre: string;
  base: number;
  efectivo: number; // calculated current cash
  cierre?: number; // closed cash value
  horaInicio: string;
  horaCierre?: string;
  estado: 'Abierta' | 'Cerrada';
  facturasEmitidasCount: number;
  ventasTurno: number;
}

export interface RegistroSueldo {
  id: string;
  empleadoId: string;
  monto: number;
  mes: string;
  porcentaje: number;
  fechaPago: string;
  detalle: string;
}

export interface ReporteTrabajador {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  tipo: string;
  resumen: string;
  fecha: string;
  notas: string;
}

export interface RegistroVacacion {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  estado: 'Pendiente' | 'Aprobado' | 'Gozado' | 'Rechazado';
  comentarios: string;
  totalDias: number;
}
