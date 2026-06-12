import React, { useState } from 'react';
import { Producto, Vehiculo, Factura, TurnoCaja, ReporteTrabajador, Cliente } from '../types';
import { 
  DollarSign, 
  Package, 
  Warehouse, 
  Car, 
  TrendingUp, 
  AlertTriangle, 
  RotateCw, 
  PieChart as PieIcon, 
  BarChart3, 
  UserX, 
  Calendar,
  Layers,
  ChevronRight,
  FileText,
  Clock,
  Trash2,
  Lock,
  Users
} from 'lucide-react';

interface DashboardProps {
  productos: Producto[];
  vehiculos: Vehiculo[];
  facturas: Factura[];
  activeTurno: TurnoCaja | null;
  reportes: ReporteTrabajador[];
  clientes: Cliente[];
  onSetView: (view: any) => void;
  onDeleteReporte: (id: string) => void;
}

export function Dashboard({ 
  productos, 
  vehiculos, 
  facturas, 
  activeTurno, 
  reportes, 
  clientes,
  onSetView,
  onDeleteReporte 
}: DashboardProps) {
  
  // Months of the year filter (Cambio 1: que se vean los distintos meses del año)
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  // Default to June (since current time is June 2026)
  const [selectedMonth, setSelectedMonth] = useState<string>('Junio');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger brief refresh spinner effect
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // 1. Calculate stats based on current database state
  const totalStockItems = productos.reduce((acc, p) => p.tipo === 'Producto' ? acc + p.stock : acc, 0);
  const lowStockItems = productos.filter(p => p.tipo === 'Producto' && p.stock <= p.stockMinimo);
  
  const activeVehiculos = vehiculos.filter(v => v.estado !== 'Entregado').length;
  
  // Today's total sales
  const todayStr = '2026-06-03'; // screenshot date reference is June 3rd, 2026
  const todayInvoices = facturas.filter(f => f.fecha === todayStr && f.estado === 'Activa');
  const salesToday = todayInvoices.reduce((acc, f) => acc + f.total, 0);

  // Shift cash (active turno base + active receipts)
  const currentCash = activeTurno ? activeTurno.efectivo : 123.00;

  // Monthly sales distribution factors for simulation
  const getSimulatedSalesMultiplier = (month: string) => {
    switch (month) {
      case 'Enero': return 0.6;
      case 'Febrero': return 0.7;
      case 'Marzo': return 0.85;
      case 'Abril': return 0.95;
      case 'Mayo': return 1.1;
      case 'Junio': return 1.0; // Current Month
      case 'Julio': return 1.15;
      case 'Agosto': return 0.9;
      default: return 0.8;
    }
  };

  const mult = getSimulatedSalesMultiplier(selectedMonth);

  // Simulate weekly sales
  const datasetWeekly = [
    { name: 'Sem 1', productos: Math.round(1487 * mult), servicios: Math.round(380 * mult) },
    { name: 'Sem 2', productos: Math.round(1115 * mult), servicios: Math.round(290 * mult) },
    { name: 'Sem 3', productos: Math.round(743 * mult), servicios: Math.round(180 * mult) },
    { name: 'Sem 4', productos: Math.round(371 * mult), servicios: Math.round(85 * mult) },
  ];

  // Doughnut metrics - Products vs Services
  const totalProductsSold = facturas
    .filter(f => f.estado === 'Activa')
    .flatMap(f => f.items)
    .filter(it => it.tipo === 'Producto')
    .reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0);

  const totalServicesSold = facturas
    .filter(f => f.estado === 'Activa')
    .flatMap(f => f.items)
    .filter(it => it.tipo === 'Servicio')
    .reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0);

  const totalRevenue = totalProductsSold + totalServicesSold;
  const prodPct = totalRevenue > 0 ? Math.round((totalProductsSold / totalRevenue) * 100) : 92;
  const servPct = totalRevenue > 0 ? (100 - prodPct) : 8;

  // Best selling products list from product database
  const sortedBestSellers = [...productos]
    .filter(p => p.tipo === 'Producto')
    .sort((a, b) => (a.stockMinimo - a.stock)) // simulate highly active
    .slice(0, 5);
  return (
    <div className="space-y-6 relative z-10">
      
      {/* Upper Month Selector and Controls (Cambio 1: que se vean los distintos meses) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-400 animate-pulse" />
            Panel de Control Rodríguez
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualización mensual de indicadores y alertas de taller mecánicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              id="month-filter-dropdown"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm font-semibold bg-slate-950 text-slate-200 border border-slate-800 hover:border-violet-500/50 rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-violet-500/25 outline-none cursor-pointer appearance-none"
            >
              {meses.map(m => (
                <option key={m} value={m} className="bg-slate-950">{m} 2026</option>
              ))}
            </select>
            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-violet-400 text-[10px]">
              ▼
            </div>
          </div>

          <button
            id="btn-refresh-dashboard"
            onClick={handleRefresh}
            className="p-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:bg-violet-600 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Sincronizar Datos"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Cards Grid - Modern and Immersive Vibrant Colors! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Ventas del día */}
        <div 
          onClick={() => onSetView('facturacion')}
          className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] text-violet-400 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5 font-bold" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-805">
              Hoy
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">Ventas del día</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              ${salesToday.toFixed(2)}
            </p>
            <p className="text-xs text-violet-400 font-medium mt-1">
              {todayInvoices.length} factura(s) activa(s)
            </p>
          </div>
        </div>

        {/* Card 2: Inventario */}
        <div 
          onClick={() => onSetView('inventario')}
          className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 hover:border-cyan-550/50 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] text-cyan-400 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
            <Package className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-805">
              Stock
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">Inventario total</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {totalStockItems} uds.
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-lg w-max border border-red-505/20">
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              <span>{lowStockItems.length} en stock bajo</span>
            </div>
          </div>
        </div>

        {/* Card 3: Saldo en Caja */}
        <div 
          onClick={() => onSetView('caja')}
          className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 hover:border-emerald-555/50 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] text-emerald-405 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-805">
              Cerradura
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">Saldo en caja</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              ${currentCash.toFixed(2)}
            </p>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              Turno actual en curso
            </p>
          </div>
        </div>

        {/* Card 4: Vehículos taller */}
        <div 
          onClick={() => onSetView('vehiculos')}
          className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 hover:border-fuchsia-500/50 transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] text-fuchsia-400 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
            <Car className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-805">
              Citas
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-400">Vehículos en taller</p>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {activeVehiculos} activos
            </p>
            <p className="text-xs text-fuchsia-405 font-medium mt-1">
              Trabajos mecánicos en cola
            </p>
          </div>
        </div>

      </div>

      {/* Main Charts Row with gorgeous modern colors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Bar Chart Simulation (Left, 8-span) */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-white text-sm">
                Ventas – {selectedMonth} 2026
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Volumen estimado de operaciones semanales en repuestos y servicios.
              </p>
            </div>
            
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-3 h-3 rounded-md bg-violet-500"></span>
                <span>Productos</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-3 h-3 rounded-md bg-fuchsia-450"></span>
                <span>Servicios</span>
              </div>
            </div>
          </div>

          {/* Simple Vector-based Bar Chart with neat hover behaviors & vibrant colors */}
          <div className="h-64 flex items-end justify-between px-3 gap-4 font-mono select-none">
            {datasetWeekly.map((week, idx) => {
              const maxVal = 2000;
              const prodHeight = `${(week.productos / maxVal) * 100}%`;
              const servHeight = `${(week.servicios / maxVal) * 105}%`;

              return (
                <div key={week.name} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="relative w-full flex items-end gap-1.5 h-full max-w-[70px]">
                    {/* Products Bar */}
                    <div 
                      className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                      style={{ height: prodHeight }}
                      title={`Productos: $${week.productos}`}
                    >
                      <div className="absolute -top-8 left-0 right-0 bg-slate-950 text-white rounded text-[10px] p-1 opacity-0 group-hover:opacity-100 transition-opacity text-center z-10 font-sans pointer-events-none border border-slate-800 shadow-xl">
                        P: ${week.productos}
                      </div>
                    </div>
                    {/* Services Bar */}
                    <div 
                      className="flex-1 bg-gradient-to-t from-fuchsia-600 to-fuchsia-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-[0_0_15px_rgba(217,70,239,0.15)]" 
                      style={{ height: servHeight }}
                      title={`Servicios: $${week.servicios}`}
                    >
                      <div className="absolute -top-8 left-0 right-0 bg-slate-950 text-white rounded text-[10px] p-1 opacity-0 group-hover:opacity-100 transition-opacity text-center z-10 font-sans pointer-events-none border border-slate-800 shadow-xl">
                        S: ${week.servicios}
                      </div>
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-xs text-slate-400 font-sans font-medium mt-3.5 group-hover:text-white transition-colors">
                    {week.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most sold / Más vendidos Right Side (4-span) */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-white text-sm">
              Más vendidos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Productos con mayor rotación en almacén.
            </p>
          </div>

          <div className="space-y-3.5 mt-5 flex-1">
            {sortedBestSellers.map((prod, index) => (
              <div key={prod.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-950/40 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{prod.nombre}</p>
                    <p className="text-[10px] text-slate-450 mt-0.5 uppercase tracking-wide font-mono">{prod.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-950/60 text-slate-300 border border-slate-850">
                    {15 - index} uds.
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 text-center">
            <button 
              onClick={() => onSetView('inventario')}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              Ver inventario completo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Doughnut distribution chart + Stock alert panel & behavior reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Doughnut chart of Products vs Services (4-span) */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-white text-sm">
              Ventas por tipo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribución porcentual de ingresos.</p>
          </div>

          {/* SVG Pie Chart Mockup */}
          <div className="flex justify-center items-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                {/* Background Ring */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="4"></circle>
                
                {/* Services arc (8%) */}
                <circle 
                  cx="21" cy="21" r="15.915" 
                  fill="transparent" 
                  stroke="#22d3ee" 
                  strokeWidth="5" 
                  strokeDasharray={`${servPct} ${100 - servPct}`} 
                  strokeDashoffset="0"
                ></circle>

                {/* Products arc (92%) */}
                <circle 
                  cx="21" cy="21" r="15.915" 
                  fill="transparent" 
                  stroke="#8b5cf6" 
                  strokeWidth="5" 
                  strokeDasharray={`${prodPct} ${100 - prodPct}`} 
                  strokeDashoffset={servPct}
                ></circle>
              </svg>
              
              {/* Central Text */}
              <div className="absolute text-center bg-slate-950 rounded-full w-28 h-28 flex flex-col justify-center border border-slate-900 shadow-xl">
                <span className="text-2xl font-black text-white">{prodPct}%</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Repuestos</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-800 pt-3">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-400">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                <span>Productos</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-300 mt-1">{prodPct}%</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Servicios</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-300 mt-1">{servPct}%</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert box (8-span, Page 2 format) */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Alerta de inventario crítico
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Productos que han alcanzado o superado el stock mínimo sugerido de operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 overflow-y-auto max-h-56 pr-1">
            {lowStockItems.map((prod) => (
              <div 
                key={prod.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
                id={`alert-row-${prod.id}`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-slate-200 truncate">{prod.nombre}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Mínimo requerido: {prod.stockMinimo} uds.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {prod.stock} uds.
                  </span>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="col-span-2 text-center py-6 text-slate-400 text-xs">
                Perfecto. No hay productos críticos en inventario.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 text-right">
            <button 
              onClick={() => onSetView('inventario')}
              className="text-xs font-bold text-violet-600 hover:text-white bg-slate-950 hover:bg-violet-600 border border-slate-850 hover:border-violet-500 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Reabastecer Stock de Producto
            </button>
          </div>
        </div>

      </div>

      {/* Page 3: Saved behavior notes list "Reportes guardados" */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <UserX className="w-4 h-4 text-violet-400" />
              Reportes guardados de clientes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notas e incidencias de clientes relevantes generadas por el sistema técnico de atención.
            </p>
          </div>
          <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
            {reportes.length} Registrados
          </span>
        </div>

        <div className="space-y-3">
          {reportes.map((rep) => (
            <div 
              key={rep.id} 
              className="flex items-start justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-850 hover:bg-slate-950/80 transition-colors gap-4"
              id={`report-item-${rep.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-violet-500/15 text-violet-400 rounded-xl mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-100">{rep.empleadoNombre}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold font-mono">
                      {rep.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 italic">
                    "{rep.notas || rep.resumen}"
                  </p>
                  <p className="text-[10px] text-slate-450 mt-1.5 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Registrado el: {rep.fecha}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDeleteReporte(rep.id)}
                className="p-1.5 bg-slate-950 hover:bg-rose-500/10 text-slate-400 hover:text-rose-455 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                title="Archivar nota"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {reportes.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-450 border border-dashed border-slate-800 rounded-xl">
              No hay reportes de clientes registrados.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
