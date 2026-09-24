import { Cliente, Factura, Producto, TurnoCaja, Usuario, Vehiculo } from './types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'taller_access_token';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function clearApiToken(): void { localStorage.removeItem(TOKEN_KEY); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, body?.message || 'No se pudo completar la operación');
  return body as T;
}

const isoToDate = (value?: string | Date) => value ? new Date(value).toISOString().split('T')[0] : '';
const roleMap: Record<string, Usuario['cargo']> = { ADMINISTRADOR: 'Administrador', RECEPCIONISTA: 'Recepcionista', MECANICO: 'Mecánico', SUPER_USUARIO: 'Súper Usuario' };
const statusMap: Record<string, Vehiculo['estado']> = { EN_REVISION: 'En revisión', EN_ESPERA: 'En espera', ENTREGADO: 'Entregado' };
const productTypeMap: Record<string, Producto['tipo']> = { PRODUCTO: 'Producto', SERVICIO: 'Servicio' };

export function mapUser(value: any): Usuario {
  return { id: value.id, nombre: value.name, dui: value.dui, telefono: value.phone || '', correo: value.email || '', cargo: roleMap[value.role] || 'Recepcionista', sueldoBase: Number(value.baseSalary || 0), porcentajeGanancia: Number(value.commissionPercent || 0), fechaContratacion: isoToDate(value.hiredAt), tieneLicencia: Boolean(value.hasLicense), avatarUrl: value.avatarUrl };
}
export function mapCustomer(value: any): Cliente {
  return { id: value.id, nombre: value.name, telefono: value.phone, dui: value.dui || '', correo: value.email || '', nit: value.nit || '', nrc: value.nrc || '', frecuenciaVisita: value.visitFrequency === 'FRECUENTE' ? 'Frecuente' : value.visitFrequency === 'MUY_POCO' ? 'Muy poco' : 'Regular', direccion: value.address, activo: value.active };
}
export function mapVehicle(value: any): Vehiculo {
  return { id: value.id, placa: value.plate, marca: value.make, modelo: value.model, año: value.modelYear, estado: statusMap[value.status] || 'En revisión', fechaIngreso: isoToDate(value.intakeAt), fechaSalida: isoToDate(value.deliveredAt), diagnostico: value.diagnosis || '', clienteId: value.customerId, empleadoId: value.assignedMechanicId, fotoUrl: value.photoUrl, tarjetaUrlFront: value.registrationFrontUrl, tarjetaUrlBack: value.registrationBackUrl, trabajosRealizados: value.workOrders?.flatMap((order: any) => order.tasks?.map((task: any) => task.description) || []) || [] };
}
export function mapProduct(value: any): Producto {
  return { id: value.id, sku: value.sku, nombre: value.name, tipo: productTypeMap[value.type] || 'Producto', stock: Number(value.stock || 0), compra: Number(value.purchasePrice || 0), venta: Number(value.salePrice || 0), proveedor: value.supplier?.name || '', clasificacion: value.classification, stockMinimo: Number(value.minimumStock || 0), stockMaximo: Number(value.maximumStock || 0), descripcion: value.description || '' };
}
export function mapShift(value: any): TurnoCaja {
  return { id: value.id, turnoNumero: value.shiftNumber, fecha: isoToDate(value.openedAt), responsableId: value.responsibleId, responsableNombre: value.responsible?.name || '', base: Number(value.openingAmount || 0), efectivo: Number(value.expectedAmount || 0), cierre: value.countedAmount == null ? undefined : Number(value.countedAmount), horaInicio: new Date(value.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), horaCierre: value.closedAt ? new Date(value.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined, estado: value.status === 'ABIERTA' ? 'Abierta' : 'Cerrada', facturasEmitidasCount: value._count?.invoices || 0, ventasTurno: Number(value.expectedAmount || 0) - Number(value.openingAmount || 0) };
}
export function mapInvoice(value: any): Factura {
  return { id: value.id, codigo: value.code, clienteId: value.customerId, clienteNombre: value.customer?.name || '', vehiculoId: value.vehicleId, vehiculoPlaca: value.vehicle?.plate, tipo: value.type === 'CREDITO_FISCAL' ? 'Crédito Fiscal' : 'Consumidor Final', total: Number(value.total || 0), fecha: isoToDate(value.issuedAt), items: (value.items || []).map((item: any) => ({ productoId: item.productId, nombre: item.description, tipo: item.itemType === 'SERVICIO' ? 'Servicio' : 'Producto', cantidad: Number(item.quantity), precioUnitario: Number(item.unitPrice) })), ofertaId: value.offerId, descuento: Number(value.discount || 0), estado: value.status === 'ANULADA' ? 'Anulada' : 'Activa' };
}

export const api = {
  login: async (identifier: string, password: string) => { const result = await request<{ accessToken: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }); localStorage.setItem(TOKEN_KEY, result.accessToken); return mapUser(result.user); },
  me: async () => mapUser(await request<any>('/auth/me')),
  customers: async () => (await request<any[]>('/customers')).map(mapCustomer),
  createCustomer: async (value: Omit<Cliente, 'id'>) => mapCustomer(await request<any>('/customers', { method: 'POST', body: JSON.stringify({ name: value.nombre, phone: value.telefono, dui: value.dui || undefined, email: value.correo || undefined, nit: value.nit || undefined, nrc: value.nrc || undefined, address: value.direccion }) })),
  updateCustomer: async (value: Cliente) => mapCustomer(await request<any>(`/customers/${value.id}`, { method: 'PATCH', body: JSON.stringify({ name: value.nombre, phone: value.telefono, dui: value.dui, email: value.correo, nit: value.nit, nrc: value.nrc, address: value.direccion, active: value.activo }) })),
  deleteCustomer: (id: string) => request<any>(`/customers/${id}`, { method: 'DELETE' }),
  vehicles: async () => (await request<any[]>('/vehicles')).map(mapVehicle),
  createVehicle: async (value: Omit<Vehiculo, 'id' | 'trabajosRealizados'>) => mapVehicle(await request<any>('/vehicles', { method: 'POST', body: JSON.stringify({ customerId: value.clienteId, plate: value.placa, make: value.marca, model: value.modelo, modelYear: value.año, diagnosis: value.diagnostico, assignedMechanicId: value.empleadoId }) })),
  updateVehicle: async (value: Vehiculo) => mapVehicle(await request<any>(`/vehicles/${value.id}`, { method: 'PATCH', body: JSON.stringify({ customerId: value.clienteId, plate: value.placa, make: value.marca, model: value.modelo, modelYear: value.año, diagnosis: value.diagnostico, assignedMechanicId: value.empleadoId }) })),
  deliverVehicle: async (id: string) => mapVehicle(await request<any>(`/vehicles/${id}/deliver`, { method: 'POST' })),
  products: async () => (await request<any[]>('/products')).map(mapProduct),
  createProduct: async (value: Omit<Producto, 'id' | 'sku'>) => mapProduct(await request<any>('/products', { method: 'POST', body: JSON.stringify({ sku: `SKU-${Date.now()}`, name: value.nombre, type: value.tipo === 'Servicio' ? 'SERVICIO' : 'PRODUCTO', purchasePrice: value.compra, salePrice: value.venta, minimumStock: value.stockMinimo, maximumStock: value.stockMaximo, classification: value.clasificacion, description: value.descripcion }) })),
  updateProduct: async (value: Producto) => mapProduct(await request<any>(`/products/${value.id}`, { method: 'PATCH', body: JSON.stringify({ name: value.nombre, purchasePrice: value.compra, salePrice: value.venta, minimumStock: value.stockMinimo, maximumStock: value.stockMaximo, classification: value.clasificacion, description: value.descripcion }) })),
  deleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  adjustStock: async (id: string, quantity: number, reason: string) => mapProduct(await request<any>(`/products/${id}/stock-adjustments`, { method: 'POST', body: JSON.stringify({ quantity, reason }) })),
  activeShift: async () => { const value = await request<any>('/cash/active'); return value ? mapShift(value) : null; },
  shifts: async () => (await request<any[]>('/cash/shifts')).map(mapShift),
  openShift: async (openingAmount: number) => mapShift(await request<any>('/cash/shifts', { method: 'POST', body: JSON.stringify({ openingAmount }) })),
  closeShift: async (id: string, countedAmount: number) => mapShift(await request<any>(`/cash/shifts/${id}/close`, { method: 'POST', body: JSON.stringify({ countedAmount }) })),
  invoices: async () => (await request<any[]>('/invoices')).map(mapInvoice),
  createInvoice: async (value: { customerId: string; vehicleId?: string; type: string; items: { productId: string; quantity: number }[] }) => mapInvoice(await request<any>('/invoices', { method: 'POST', body: JSON.stringify({ ...value, type: value.type === 'Crédito Fiscal' ? 'CREDITO_FISCAL' : 'CONSUMIDOR_FINAL' }) })),
  annulInvoice: async (id: string, reason: string) => mapInvoice(await request<any>(`/invoices/${id}/annul`, { method: 'POST', body: JSON.stringify({ reason }) })),
};