import { Usuario, Vehiculo, Cliente, Producto, Oferta, Proveedor, Factura, TurnoCaja, ReporteTrabajador, RegistroSueldo } from './types';

export const INITIAL_EMPLEADOS: Usuario[] = [
  {
    id: 'emp-1',
    nombre: 'Marlon Chicas',
    dui: '12345678-9',
    telefono: '21212828',
    correo: 'mchicas@tallerrodriguez.com',
    cargo: 'Administrador',
    sueldoBase: 500.00,
    fechaContratacion: '2025-01-01',
    tieneLicencia: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    password: '123' // default same as dui without dash or simple "123"
  },
  {
    id: 'emp-2',
    nombre: 'Jared',
    dui: '1234567-8',
    telefono: '12345678',
    correo: 'jared@tallerrodriguez.com',
    cargo: 'Mecánico',
    sueldoBase: 400.00,
    fechaContratacion: '2025-01-15',
    tieneLicencia: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    password: '123'
  },
  {
    id: 'emp-3',
    nombre: 'Heysell',
    dui: '0987654-8',
    telefono: '60078577',
    correo: 'heysellmaricelarodriguezloza@gmail.com',
    cargo: 'Súper Usuario',
    sueldoBase: 7000.00,
    porcentajeGanancia: 50,
    fechaContratacion: '2024-05-01',
    tieneLicencia: false,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    password: '123'
  },
  {
    id: 'emp-4',
    nombre: 'Leonel',
    dui: '1234689-1',
    telefono: '32098765',
    correo: 'leonel@tallerrodriguez.com',
    cargo: 'Mecánico',
    sueldoBase: 300.00,
    fechaContratacion: '2025-02-01',
    tieneLicencia: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    password: '123'
  }
];

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Santiago',
    telefono: '7850-2412',
    dui: '05128362-9',
    correo: 'santiago@gmail.com',
    nit: '0614-230985-102-1',
    nrc: '293812-4',
    frecuenciaVisita: 'Frecuente',
    direccion: 'Colonia Escalon, Calle El Mirador, San Salvador',
    activo: true
  },
  {
    id: 'cli-2',
    nombre: 'Consumidor Final',
    telefono: '0000-0000',
    dui: '00000000-0',
    correo: 'consumidorfinal@tallerrodriguez.com',
    frecuenciaVisita: 'Frecuente',
    direccion: 'San Salvador',
    activo: true
  },
  {
    id: 'cli-3',
    nombre: 'Prueba2',
    telefono: '7112-9081',
    dui: '04829312-3',
    correo: 'prueba2@outlook.com',
    frecuenciaVisita: 'Regular',
    direccion: 'Santa Tecla, La Libertad',
    activo: true
  },
  {
    id: 'cli-4',
    nombre: 'Asturias',
    telefono: '19422491',
    dui: '08312411-8',
    correo: 'asturias@info.com',
    nit: '0101-121280-101-2',
    nrc: '123456-7',
    frecuenciaVisita: 'Regular',
    direccion: 'Antiguo Cuscatlan, El Salvador',
    activo: true
  },
  {
    id: 'cli-5',
    nombre: 'Alejandra',
    telefono: '7540-3912',
    dui: '06124589-7',
    correo: 'alejandra@gmail.com',
    frecuenciaVisita: 'Muy poco',
    direccion: 'Lourdes Colón, La Libertad',
    activo: true
  }
];

export const INITIAL_VEHICULOS: Vehiculo[] = [
  {
    id: 'veh-1',
    placa: 'En trámite',
    marca: 'Hondas',
    modelo: 'Honda NSX',
    año: 2000,
    estado: 'En revisión',
    fechaIngreso: '2026-05-31',
    diagnostico: 'Revisión general de caja de cambios y escape. Presenta fallas en revoluciones altas.',
    clienteId: 'cli-1', // Santiago
    empleadoId: 'emp-2', // Jared
    fotoUrl: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400',
    tarjetaUrlFront: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
    tarjetaUrlBack: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
    trabajosRealizados: [
      'Diagnóstico de sensor de posición',
      'Desmontaje de cárter de caja para inspección'
    ]
  },
  {
    id: 'veh-2',
    placa: 'P 1111',
    marca: 'Toyota',
    modelo: 'Corolla 2008',
    año: 2008,
    estado: 'En revisión',
    fechaIngreso: '2026-05-22',
    diagnostico: 'Cambio de pastillas delanteras y sensor de temperatura dañados.',
    clienteId: 'cli-3', // Prueba2
    empleadoId: 'emp-4', // Leonel
    fotoUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400',
    trabajosRealizados: [
      'Reemplazo de pastillas de frenos delanteras',
      'Purga de líquido de frenos'
    ]
  },
  {
    id: 'veh-3',
    placa: 'P 1234-6768',
    marca: 'Kia',
    modelo: 'Soul 2010',
    año: 2010,
    estado: 'En espera',
    fechaIngreso: '2026-05-21',
    diagnostico: 'Cambio de amortiguadores delanteros y soportes de motor.',
    clienteId: 'cli-5', // Alejandra
    empleadoId: 'emp-2', // Jared
    fotoUrl: 'https://images.unsplash.com/photo-1627454820516-dc767bcb4d3e?auto=format&fit=crop&q=80&w=400',
    trabajosRealizados: []
  }
];

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: 'prod-1',
    sku: "AC'EUR",
    nombre: 'Aceite Motor Premium 10W40',
    tipo: 'Producto',
    stock: 9,
    compra: 10.00,
    venta: 14.00,
    proveedor: 'Taller Supply SV',
    clasificacion: 'Motor',
    stockMinimo: 10,
    stockMaximo: 999,
    descripcion: 'Aceite sintético de alto desempeño europeo.'
  },
  {
    id: 'prod-2',
    sku: 'FRNDEL01',
    nombre: 'Pastillas de freno delanteras',
    tipo: 'Producto',
    stock: 14,
    compra: 16.00,
    venta: 22.00,
    proveedor: 'Tecno Lubricantes',
    clasificacion: 'Frenos',
    stockMinimo: 10,
    stockMaximo: 999,
    descripcion: 'Pastillas cerámicas de alto frenado silencioso.'
  },
  {
    id: 'prod-3',
    sku: 'FRNTRA01',
    nombre: 'Pastillas de freno traseras',
    tipo: 'Producto',
    stock: 11,
    compra: 14.00,
    venta: 20.00,
    proveedor: 'Tecno Lubricantes',
    clasificacion: 'Frenos',
    stockMinimo: 10,
    stockMaximo: 999,
    descripcion: 'Pastillas orgánicas metálicas.'
  },
  {
    id: 'prod-4',
    sku: 'ACE2050',
    nombre: 'Aceite 20W50 Mineral',
    tipo: 'Producto',
    stock: 9,
    compra: 8.00,
    venta: 11.50,
    proveedor: 'LubriCentro Nacional',
    clasificacion: 'Aceites y fluidos',
    stockMinimo: 10,
    stockMaximo: 999,
    descripcion: 'Lubricante para motores con alto kilometraje.'
  },
  {
    id: 'prod-5',
    sku: 'FILTOT02',
    nombre: 'Filtro de aire Toyota original',
    tipo: 'Producto',
    stock: 16,
    compra: 5.50,
    venta: 8.00,
    proveedor: 'AutoPartes Centro',
    clasificacion: 'Motor',
    stockMinimo: 10,
    stockMaximo: 999,
    descripcion: 'Filtro de aire de alta filtración de polvo.'
  },
  {
    id: 'prod-6',
    sku: 'SERV01',
    nombre: 'Revisión eléctrica integral',
    tipo: 'Servicio',
    stock: 999, // unlimited for services
    compra: 0.00,
    venta: 22.00,
    proveedor: 'Taller Rodríguez',
    clasificacion: 'Servicio',
    stockMinimo: 0,
    stockMaximo: 999,
    descripcion: 'Análisis asistido por scanner y multímetro.'
  },
  {
    id: 'prod-7',
    sku: 'SERV02',
    nombre: 'Cambio de aceite y filtro',
    tipo: 'Servicio',
    stock: 999,
    compra: 0.00,
    venta: 10.00,
    proveedor: 'Taller Rodríguez',
    clasificacion: 'Servicio',
    stockMinimo: 0,
    stockMaximo: 999,
    descripcion: 'Mano de obra para cambio rápido.'
  }
];

export const INITIAL_PROVEEDORES: Proveedor[] = [
  {
    id: 'prov-1',
    nombre: 'LubriCentro Nacional',
    telefono: '2234-9871',
    locacion: 'San Salvador',
    correo: 'ventas@lubricentronacional.com',
    tipo: 'Nacional'
  },
  {
    id: 'prov-2',
    nombre: 'AutoPartes Centro',
    telefono: '2440-1289',
    locacion: 'Santa Ana',
    correo: 'pedidos@autopartescentro.com',
    tipo: 'Nacional'
  },
  {
    id: 'prov-3',
    nombre: 'Distribuidora El Motor',
    telefono: '2661-8930',
    locacion: 'San Miguel',
    correo: 'mayorista@elmotor.com',
    tipo: 'Nacional'
  },
  {
    id: 'prov-4',
    nombre: 'Tecno Lubricantes',
    telefono: '2330-0192',
    locacion: 'La Libertad',
    correo: 'soporte@tecnolubricantes.com',
    tipo: 'Nacional'
  },
  {
    id: 'prov-5',
    nombre: 'Importadora Rodamientos SV',
    telefono: '2452-3391',
    locacion: 'Sonsonate',
    correo: 'rodamientos_sv@gmail.com',
    tipo: 'Nacional'
  }
];

export const INITIAL_OFERTAS: Oferta[] = [
  {
    id: 'of-1',
    nombre: 'hey',
    descripcion: 'Descuento especial de temporada',
    porcentajeDescuento: 15,
    fechaInicio: '2026-06-03',
    fechaFin: '2026-07-03',
    activo: true
  },
  {
    id: 'of-2',
    nombre: 'heysell',
    descripcion: 'Oferta premium del mes',
    porcentajeDescuento: 100,
    fechaInicio: '2026-06-03',
    fechaFin: '2026-07-03',
    activo: true
  },
  {
    id: 'of-3',
    nombre: 'Oferta dfgdf',
    descripcion: 'Descuento para repuestos de frenos',
    porcentajeDescuento: 100,
    fechaInicio: '2026-06-03',
    fechaFin: '2026-07-03',
    activo: true
  },
  {
    id: 'of-4',
    nombre: 'Oferta Leonell',
    descripcion: 'Descuento especial por inauguración',
    porcentajeDescuento: 30,
    fechaInicio: '2026-05-26',
    fechaFin: '2026-06-25',
    activo: true
  }
];

export const INITIAL_FACTURAS: Factura[] = [
  {
    id: 'fac-1',
    codigo: 'FAC-0232',
    clienteId: 'cli-1',
    clienteNombre: 'Santiago',
    vehiculoId: 'veh-1',
    vehiculoPlaca: 'En trámite',
    tipo: 'Consumidor Final',
    total: 235.04,
    fecha: '2026-06-03',
    items: [
      { productoId: 'prod-1', nombre: 'Aceite Motor Premium 10W40', tipo: 'Producto', cantidad: 4, precioUnitario: 14.00 },
      { productoId: 'prod-2', nombre: 'Pastillas de freno delanteras', tipo: 'Producto', cantidad: 2, precioUnitario: 22.00 },
      { productoId: 'prod-6', nombre: 'Revisión eléctrica integral', tipo: 'Servicio', cantidad: 1, precioUnitario: 22.00 }
    ],
    estado: 'Activa'
  },
  {
    id: 'fac-2',
    codigo: 'FAC-0231',
    clienteId: 'cli-2',
    clienteNombre: 'Consumidor Final',
    tipo: 'Consumidor Final',
    total: 45.20,
    fecha: '2026-06-03',
    items: [
      { productoId: 'prod-5', nombre: 'Filtro de aire Toyota original', tipo: 'Producto', cantidad: 1, precioUnitario: 8.00 },
      { productoId: 'prod-2', nombre: 'Pastillas de freno delanteras', tipo: 'Producto', cantidad: 1, precioUnitario: 22.00 }
    ],
    estado: 'Activa'
  },
  {
    id: 'fac-3',
    codigo: 'FAC-0230',
    clienteId: 'cli-2',
    clienteNombre: 'Consumidor Final',
    tipo: 'Consumidor Final',
    total: 29.38,
    fecha: '2026-06-03',
    items: [
      { productoId: 'prod-4', nombre: 'Aceite 20W50 Mineral', tipo: 'Producto', cantidad: 2, precioUnitario: 11.50 }
    ],
    estado: 'Activa'
  },
  {
    id: 'fac-4',
    codigo: 'FAC-0229',
    clienteId: 'cli-3',
    clienteNombre: 'Prueba2',
    vehiculoId: 'veh-2',
    vehiculoPlaca: 'P 1111',
    tipo: 'Consumidor Final',
    total: 49.72,
    fecha: '2026-06-03',
    items: [
      { productoId: 'prod-3', nombre: 'Pastillas de freno traseras', tipo: 'Producto', cantidad: 2, precioUnitario: 20.00 },
      { productoId: 'prod-7', nombre: 'Cambio de aceite y filtro', tipo: 'Servicio', cantidad: 1, precioUnitario: 10.00 }
    ],
    estado: 'Activa'
  },
  {
    id: 'fac-5',
    codigo: 'FAC-0228',
    clienteId: 'cli-4',
    clienteNombre: 'Asturias',
    tipo: 'Crédito Fiscal',
    total: 24.86,
    fecha: '2026-06-03',
    items: [
      { productoId: 'prod-1', nombre: 'Aceite Motor Premium 10W40', tipo: 'Producto', cantidad: 1, precioUnitario: 14.00 }
    ],
    estado: 'Activa'
  }
];

export const INITIAL_HISTORIAL_TURNOS: TurnoCaja[] = [
  {
    id: 'tr-1',
    turnoNumero: 19,
    fecha: '2026-06-03',
    responsableId: 'emp-3', // Heysell
    responsableNombre: 'Heysell',
    base: 123.00,
    efectivo: 358.04,
    cierre: 358.04,
    horaInicio: '20:11',
    horaCierre: '21:06',
    estado: 'Cerrada',
    facturasEmitidasCount: 1,
    ventasTurno: 235.04
  },
  {
    id: 'tr-2',
    turnoNumero: 18,
    fecha: '2026-06-03',
    responsableId: 'emp-3',
    responsableNombre: 'Heysell',
    base: 1.00,
    efectivo: 150.16,
    cierre: 150.16,
    horaInicio: '09:42',
    horaCierre: '11:26',
    estado: 'Cerrada',
    facturasEmitidasCount: 2,
    ventasTurno: 149.16
  },
  {
    id: 'tr-3',
    turnoNumero: 16,
    fecha: '2026-06-01',
    responsableId: 'emp-3',
    responsableNombre: 'Heysell',
    base: 10.00,
    efectivo: 64.24,
    cierre: 64.24,
    horaInicio: '22:21',
    horaCierre: '22:49',
    estado: 'Cerrada',
    facturasEmitidasCount: 1,
    ventasTurno: 54.24
  },
  {
    id: 'tr-4',
    turnoNumero: 15,
    fecha: '2026-06-01',
    responsableId: 'emp-3',
    responsableNombre: 'Heysell',
    base: 10.00,
    efectivo: 34.86,
    cierre: 34.86,
    horaInicio: '21:49',
    horaCierre: '22:18',
    estado: 'Cerrada',
    facturasEmitidasCount: 1,
    ventasTurno: 24.86
  }
];

export const INITIAL_REPORTES_TRABAJADORES: ReporteTrabajador[] = [
  {
    id: 'rep-1',
    empleadoId: 'emp-1',
    empleadoNombre: 'Marlon Chicas',
    tipo: 'Comportamiento',
    resumen: 'Llegada tarde a turno matutino',
    fecha: '2026-06-03',
    notas: 'Llegó 45 minutos tarde al taller alegando problemas de tráfico en Autopista Los Chorros.'
  },
  {
    id: 'rep-2',
    empleadoId: 'emp-4',
    empleadoNombre: 'Leonel',
    tipo: 'Felicitación',
    resumen: 'Excelente diagnóstico en motor hibrido',
    fecha: '2026-06-02',
    notas: 'Diagnosticó de forma muy rápida una fuga de corriente en la batería del Toyota Prius de forma certera.'
  }
];

// Database state driver (frontend-only, no persistence)
export class LocalDataBase {
  static get<T>(key: string, initial: T): T {
    return initial;
  }

  static set<T>(key: string, val: T): void {
    // no-op: frontend only, nothing is persisted
  }

  static getEmpleados(): Usuario[] {
    return this.get<Usuario[]>('empleados', INITIAL_EMPLEADOS);
  }
  static saveEmpleados(data: Usuario[]): void {
    this.set('empleados', data);
  }

  static getClientes(): Cliente[] {
    return this.get<Cliente[]>('clientes', INITIAL_CLIENTES);
  }
  static saveClientes(data: Cliente[]): void {
    this.set('clientes', data);
  }

  static getVehiculos(): Vehiculo[] {
    return this.get<Vehiculo[]>('vehiculos', INITIAL_VEHICULOS);
  }
  static saveVehiculos(data: Vehiculo[]): void {
    this.set('vehiculos', data);
  }

  static getProductos(): Producto[] {
    return this.get<Producto[]>('productos', INITIAL_PRODUCTOS);
  }
  static saveProductos(data: Producto[]): void {
    this.set('productos', data);
  }

  static getProveedores(): Proveedor[] {
    return this.get<Proveedor[]>('proveedores', INITIAL_PROVEEDORES);
  }
  static saveProveedores(data: Proveedor[]): void {
    this.set('proveedores', data);
  }

  static getOfertas(): Oferta[] {
    return this.get<Oferta[]>('ofertas', INITIAL_OFERTAS);
  }
  static saveOfertas(data: Oferta[]): void {
    this.set('ofertas', data);
  }

  static getFacturas(): Factura[] {
    return this.get<Factura[]>('facturas', INITIAL_FACTURAS);
  }
  static saveFacturas(data: Factura[]): void {
    this.set('facturas', data);
  }

  static getHistorialTurnos(): TurnoCaja[] {
    return this.get<TurnoCaja[]>('turnos', INITIAL_HISTORIAL_TURNOS);
  }
  static saveHistorialTurnos(data: TurnoCaja[]): void {
    this.set('turnos', data);
  }

  static getReportesTrabajadores(): ReporteTrabajador[] {
    return this.get<ReporteTrabajador[]>('reportes_trabajador', INITIAL_REPORTES_TRABAJADORES);
  }
  static saveReportesTrabajadores(data: ReporteTrabajador[]): void {
    this.set('reportes_trabajador', data);
  }

  static getActiveTurno(): TurnoCaja | null {
    return this.get<TurnoCaja | null>('active_turno', {
      id: 'tr-active',
      turnoNumero: 20,
      fecha: '2026-06-09',
      responsableId: 'emp-3', // Heysell by default
      responsableNombre: 'Heysell',
      base: 123.00,
      efectivo: 123.00, // starts at base
      horaInicio: '08:00',
      estado: 'Abierta',
      facturasEmitidasCount: 0,
      ventasTurno: 0
    });
  }
  static saveActiveTurno(data: TurnoCaja | null): void {
    this.set('active_turno', data);
  }

  static getCurrentUser(): Usuario {
    return this.get<Usuario>('current_user', INITIAL_EMPLEADOS[2]); // Default Heysell (Súper Usuario)
  }
  static saveCurrentUser(data: Usuario): void {
    this.set('current_user', data);
  }

  static isLogged(): boolean {
    return this.get<boolean>('is_logged', true); // Default logged in for easier preview
  }
  static saveLogged(logged: boolean): void {
    this.set('is_logged', logged);
  }

  static resetDatabase(): void {
    window.location.reload();
  }
}
