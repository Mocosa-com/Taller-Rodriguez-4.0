import React from 'react';
import { ActiveView } from './Sidebar';
import { ArrowUpRight, CheckCircle2, CircleAlert, Gauge } from 'lucide-react';

interface MenuDashboardProps {
  onSetView: (view: ActiveView) => void;
  activeVehiculosCount: number;
  lowStockCount: number;
  activeTurnoState: boolean;
}

export function MenuDashboard({ 
  onSetView, 
  activeVehiculosCount, 
  lowStockCount,
  activeTurnoState
}: MenuDashboardProps) {

  const menuCards = [
    {
      id: 'caja' as ActiveView,
      label: 'Caja',
      description: activeTurnoState ? 'Turno abierto' : 'Turno cerrado',
      img: '/assets/sidebar/caja.png',
      badge: activeTurnoState ? 'Manejar' : undefined,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15',
    },
    {
      id: 'clientes' as ActiveView,
      label: 'Clientes',
      description: 'Expediente del taller',
      img: '/assets/sidebar/cliente.png',
    },
    {
      id: 'empleados' as ActiveView,
      label: 'Empleados',
      description: 'Personal & Sueldos',
      img: '/assets/sidebar/empleados.png',
    },
    {
      id: 'ofertas' as ActiveView,
      label: 'Ofertas',
      description: 'Campañas de descuento',
      img: '/assets/sidebar/ofertas.png',
    },
    {
      id: 'inventario' as ActiveView,
      label: 'Inventario',
      description: 'Gestión de stock',
      img: '/assets/sidebar/bodega.png',
      badge: lowStockCount > 0 ? `${lowStockCount} Bajo` : undefined,
      badgeColor: 'bg-amber-500/10 text-amber-600 border border-amber-500/15',
    },
    {
      id: 'facturacion' as ActiveView,
      label: 'Facturación',
      description: 'Emisión de facturas',
      img: '/assets/sidebar/facturacion.png',
    },
    {
      id: 'vehiculos' as ActiveView,
      label: 'Vehículos',
      description: 'En el taller',
      img: '/assets/sidebar/coche.png',
      badge: activeVehiculosCount > 0 ? `${activeVehiculosCount} Activos` : undefined,
      badgeColor: 'bg-violet-500/10 text-violet-600 border border-violet-500/15',
    },
    {
      id: 'reportes' as ActiveView,
      label: 'Reportes',
      description: 'Estadísticas & Ventas',
      img: '/assets/sidebar/reportes.png',
    },
    {
      id: 'proveedores' as ActiveView,
      label: 'Proveedores',
      description: 'Contactos directos',
      img: '/assets/sidebar/proveedores.png',
    },
    {
      id: 'perfil' as ActiveView,
      label: 'Mi perfil',
      description: 'Rol y Configuración',
      img: '/assets/sidebar/perfil.png',
    }
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl space-y-7 px-1 py-4 animate-in fade-in duration-300 md:px-6 md:py-8">
      
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-7 text-white shadow-xl shadow-slate-900/10 md:px-10 md:py-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="relative flex min-w-0 flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
            <img src="/assets/logo_taller.png" alt="Logo Taller Rodríguez" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300">Centro de operaciones</p>
              <h1 className="truncate font-display text-2xl font-bold tracking-tight md:text-3xl">Taller Rodríguez</h1>
              <p className="mt-1 truncate text-sm text-slate-300">Todo listo para coordinar el día.</p>
            </div>
          </div>
          <div className="grid w-full min-w-0 grid-cols-3 gap-2 md:w-[330px] md:flex-shrink-0">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
              <Gauge className="mb-2 h-4 w-4 text-cyan-300" />
              <p className="text-xl font-bold">{activeVehiculosCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-300">En taller</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
              <CircleAlert className="mb-2 h-4 w-4 text-amber-300" />
              <p className="text-xl font-bold">{lowStockCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-300">Alertas</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
              <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-300" />
              <p className="text-xl font-bold">{activeTurnoState ? 'OK' : '--'}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-300">Caja</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">Accesos rápidos</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-100">¿Qué necesitas gestionar?</h2>
        </div>
        <span className="hidden text-xs font-medium text-slate-500 sm:block">10 módulos disponibles</span>
      </div>

      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fit,minmax(175px,1fr))]">
        {menuCards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => onSetView(card.id)}
              className="group relative flex min-h-[145px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:bg-white hover:shadow-xl hover:shadow-violet-900/10 sm:min-h-[165px] sm:p-6"
            >
              {/* Badge indicator if any */}
              {card.badge && (
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-extrabold whitespace-nowrap sm:right-3 sm:top-3 sm:text-[9px] ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}

              {/* Large styled icon (real workshop artwork) */}
              <div className="rounded-2xl border border-[#3b315e] bg-[#180c34] p-3 shadow-inner shadow-black/20 transition-all duration-300 group-hover:scale-105 group-hover:border-violet-300 group-hover:bg-[#24144d] sm:p-4">
                <img src={card.img} alt={card.label} className="menu-dashboard-icon h-7 w-7 object-contain sm:h-8 sm:w-8" />
              </div>

              {/* Label */}
              <span className="mt-3 text-xs font-black uppercase tracking-wide text-slate-200 transition-colors group-hover:text-violet-700 sm:mt-4 sm:text-sm">
                {card.label}
              </span>

              {/* Description */}
              <span className="mt-1 max-w-full truncate text-[9px] font-semibold text-slate-500 group-hover:text-slate-600 sm:text-[10px]">
                {card.description}
              </span>
              <ArrowUpRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-slate-700 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </div>

    </div>
  );
}
